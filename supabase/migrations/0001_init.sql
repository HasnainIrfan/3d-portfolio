-- The only SQL file in this project. Run it once, top to bottom, in the
-- Supabase Dashboard → SQL Editor. Then run one line from the very bottom to
-- create your admin.
--
-- Everything here is idempotent: re-running it is always safe and never drops
-- your data or your admin list.
--
-- What it builds:
--   1. contact_submissions — the table every enquiry lands in
--   2. admin_users         — the allowlist of people who may read it
--   3. is_admin()          — the check every policy calls
--   4. Row-level security  — who may do what
--   5. grant_admin() and friends — how you add an admin
--
-- Design note. There is no service-role key anywhere in the application, so
-- these policies are not a second opinion on top of some privileged client —
-- they are the only thing standing between a visitor and this data.

create extension if not exists "pgcrypto";


/* ========================================================================== */
/*  1. contact_submissions                                                    */
/* ========================================================================== */

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  budget      text,
  message     text not null,
  source      text default 'portfolio',
  user_agent  text,
  ip_address  text,
  created_at  timestamptz not null default now(),

  -- Written by the notify-contact Edge Function after it tries to send. null
  -- means "never attempted", which is not the same as a failure — /admin only
  -- warns on an explicit false.
  email_sent  boolean,
  email_error text
);

-- Both columns arrived after the first version of this table, so an existing
-- database needs them added rather than created.
alter table public.contact_submissions
  add column if not exists email_sent  boolean,
  add column if not exists email_error text;

-- The admin list is ordered newest-first and the dashboard counts a trailing
-- 7-day window; both read straight off this index.
create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- Length limits enforced in the database, not only in the route handler. The
-- insert policy below is open to anonymous callers, so the REST endpoint is
-- reachable directly with the public anon key — these bounds are what stop a
-- direct caller writing megabytes into the table.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_submissions_lengths'
  ) then
    alter table public.contact_submissions
      add constraint contact_submissions_lengths check (
        char_length(name)    between 1 and 120
        and char_length(email)   between 3 and 200
        and char_length(message) between 1 and 5000
        and (budget is null or char_length(budget) <= 100)
        and (user_agent is null or char_length(user_agent) <= 500)
      );
  end if;
end $$;

alter table public.contact_submissions enable row level security;


/* ========================================================================== */
/*  2. admin_users — the allowlist                                            */
/* ========================================================================== */

-- Being signed in and being an admin are two different things, and this table
-- exists to keep them apart. Supabase Auth answers "is this a real user?".
-- This answers "is this user allowed to read the enquiries?".
--
-- Without that separation, anyone who obtained an account on this project —
-- through a signup you left open, an invite meant for something else, an OAuth
-- provider you enable later — could read every visitor's name, email address
-- and IP.

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Allowlist of Supabase users permitted to read contact submissions. Add rows with select public.grant_admin(''you@example.com'');';

-- Brings an admin_users table left over from an older revision up to the shape
-- the policies expect, instead of silently skipping the create above and
-- failing later on a missing column.
alter table public.admin_users
  add column if not exists email      text,
  add column if not exists created_at timestamptz not null default now();

alter table public.admin_users enable row level security;


/* ========================================================================== */
/*  3. is_admin()                                                             */
/* ========================================================================== */

-- security definer matters here, and not for the usual reason.
--
-- The policies below call this function, and the function reads admin_users,
-- which itself has RLS. Evaluated as the caller that recurses: the policy asks
-- the function, the function triggers the policy, and Postgres raises
-- "infinite recursion detected in policy". Running as the definer reads the
-- table without RLS and breaks the cycle.
--
-- The pinned search_path is not optional. Without it, a caller who can create
-- objects could put their own `admin_users` earlier on the path and have this
-- function read that instead.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is
  'True when the calling user is on the admin allowlist. Used by RLS policies.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


/* ========================================================================== */
/*  4. Row-level security                                                     */
/* ========================================================================== */

-- Anyone may submit the form. INSERT only: there is no accompanying select
-- policy for anon, so a visitor can add a row and can never read one back —
-- not even the one they just wrote. That is why the API route does not ask for
-- the inserted row with .select().
drop policy if exists "Anyone can submit the contact form" on public.contact_submissions;
create policy "Anyone can submit the contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read submissions" on public.contact_submissions;
create policy "Admins can read submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can delete submissions" on public.contact_submissions;
create policy "Admins can delete submissions"
  on public.contact_submissions
  for delete
  to authenticated
  using (public.is_admin());

-- No update policy, for anyone. An enquiry is a record of what a visitor
-- actually wrote; nothing in this system has a reason to edit one after the
-- fact. (The Edge Function writes email_sent through the service role, which
-- bypasses RLS — that runs inside Supabase, not in the application.)

-- An admin may see the admin list. Everyone else sees an empty table rather
-- than an error — which is what the app relies on: it looks up its own row and
-- treats "no row" as "not an admin".
drop policy if exists "Admins can read the admin list" on public.admin_users;
create policy "Admins can read the admin list"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- Deliberately no insert, update or delete policy on admin_users. Promoting an
-- admin is a thing you do in the SQL editor, on purpose, not something the
-- application can be talked into doing.


/* ========================================================================== */
/*  5. Managing admins                                                        */
/* ========================================================================== */

-- Every function below is locked to the SQL editor: EXECUTE is revoked from
-- anon and authenticated, so none of them is reachable over the API. If
-- `authenticated` could call grant_admin, any user who signed up could promote
-- themselves and read every enquiry.

create or replace function public.grant_admin(admin_email text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email) = lower(trim(admin_email))
  limit 1;

  if target_id is null then
    return format(
      'No Supabase user with the address %s. Create one first: Dashboard → Authentication → Users → Add user, or select public.create_admin_user(%L, ''a-strong-password'');',
      admin_email, admin_email
    );
  end if;

  insert into public.admin_users (user_id, email)
  values (target_id, lower(trim(admin_email)))
  on conflict (user_id) do update set email = excluded.email;

  return format('%s is now an admin.', admin_email);
end;
$$;

revoke all on function public.grant_admin(text) from public, anon, authenticated;


create or replace function public.revoke_admin(admin_email text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  removed integer;
begin
  delete from public.admin_users
  where lower(email) = lower(trim(admin_email))
  returning 1 into removed;

  if removed is null then
    return format('%s was not an admin.', admin_email);
  end if;

  -- The auth.users row is intentionally left alone: this removes access to the
  -- inbox, it does not delete the person's account.
  return format('%s is no longer an admin.', admin_email);
end;
$$;

revoke all on function public.revoke_admin(text) from public, anon, authenticated;


-- Writing to auth.users directly is a shortcut, and worth being honest about:
-- these columns belong to Supabase's auth service, and their shape can change
-- between releases. The supported path is Dashboard → Authentication → Users →
-- Add user, followed by grant_admin(). This function exists so the whole setup
-- can be done in one paste, and it is written defensively — it refuses rather
-- than half-creating an account if the address is already taken.
create or replace function public.create_admin_user(
  admin_email    text,
  admin_password text
)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  new_id uuid := gen_random_uuid();
  clean_email text := lower(trim(admin_email));
begin
  if admin_password is null or char_length(admin_password) < 12 then
    return 'Choose a password of at least 12 characters. Nothing was created.';
  end if;

  if exists (select 1 from auth.users where lower(email) = clean_email) then
    -- Already there, so just make sure it is on the allowlist. This is what
    -- makes the file safe to re-run.
    return public.grant_admin(clean_email);
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', clean_email,
    -- bcrypt, the same algorithm the auth service uses when it hashes a
    -- password itself, so the account is indistinguishable from a normal one.
    crypt(admin_password, gen_salt('bf')), now(),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    '', '', '', ''
  );

  -- Password sign-in looks the identity up, not just the user. Without this row
  -- the account exists and can never log in — a confusing failure to debug.
  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_id, new_id::text,
    jsonb_build_object('sub', new_id::text, 'email', clean_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  insert into public.admin_users (user_id, email)
  values (new_id, clean_email)
  on conflict (user_id) do nothing;

  return format('Created %s and made it an admin. Sign in at /admin/login.', clean_email);
end;
$$;

revoke all on function public.create_admin_user(text, text) from public, anon, authenticated;


/* ========================================================================== */
/*  6. Clean-up from earlier versions of this project                         */
/* ========================================================================== */

-- The first version of this project kept admins in its own table with bcrypt
-- hashes it managed itself, and counted failed logins in another. Both were
-- replaced by Supabase Auth.
drop function if exists public.verify_admin_credentials(text, text);
drop table if exists public.admin_login_attempts;


/* ========================================================================== */
/*  Now run ONE of these                                                      */
/* ========================================================================== */

-- A. You already created the user in the Dashboard (recommended):
--
--      select public.grant_admin('you@example.com');
--
-- B. Create the account and promote it in one go. Change both values, and
--    change the password again after your first sign-in:
--
--      select public.create_admin_user('you@example.com', 'a-long-unique-password');
--
-- Check who has access at any time:
--
--      select email, created_at from public.admin_users order by created_at;
--
-- Remove someone (takes away the inbox, keeps their account):
--
--      select public.revoke_admin('them@example.com');
