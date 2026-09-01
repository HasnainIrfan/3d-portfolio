-- Portfolio schema. Run once, top to bottom, in Supabase → SQL Editor.
-- Safe to re-run.

-- Your admin login is created at the bottom of this file.
-- CHANGE IT BEFORE YOU RUN THIS. See section 6.

create extension if not exists "pgcrypto";


-- 1. contact_submissions ------------------------------------------------------

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
  email_sent  boolean,
  email_error text
);

alter table public.contact_submissions
  add column if not exists email_sent  boolean,
  add column if not exists email_error text;

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

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


-- 2. admin_users --------------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists email      text,
  add column if not exists created_at timestamptz not null default now();

alter table public.admin_users enable row level security;


-- 3. is_admin() ---------------------------------------------------------------
-- security definer breaks the recursion: the policies call this, and it reads
-- admin_users, which is itself behind those policies.

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

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- 4. Row-level security -------------------------------------------------------

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

drop policy if exists "Admins can read the admin list" on public.admin_users;
create policy "Admins can read the admin list"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());


-- 5. Managing admins ----------------------------------------------------------
-- EXECUTE is revoked from anon and authenticated on all three, so none of them
-- is reachable over the API. Without that, any signed-up user could promote
-- themselves.

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
    return format('No Supabase user with the address %s.', admin_email);
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

  return format('%s is no longer an admin.', admin_email);
end;
$$;

revoke all on function public.revoke_admin(text) from public, anon, authenticated;


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
  if admin_password is null or char_length(admin_password) < 6 then
    return 'Password must be at least 6 characters. Nothing was created.';
  end if;

  if exists (select 1 from auth.users where lower(email) = clean_email) then
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
    crypt(admin_password, gen_salt('bf')), now(),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    '', '', '', ''
  );

  -- Password sign-in looks up the identity, not just the user. Without this row
  -- the account exists and can never log in.
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

  return format('Created %s. Sign in at /admin/login.', clean_email);
end;
$$;

revoke all on function public.create_admin_user(text, text) from public, anon, authenticated;


-- 6. Create the admin ---------------------------------------------------------
--
-- ############################################################################
-- #  CHANGE THESE TWO VALUES BEFORE RUNNING THIS FILE                        #
-- #                                                                          #
-- #  They are a placeholder so the file works out of the box. This           #
-- #  repository is public, so anyone who reads it knows them. Left as they    #
-- #  are, a stranger can sign in at /admin and read every visitor's name,     #
-- #  email address and IP address.                                            #
-- #                                                                          #
-- #  Use your own address and a long, unique password. Already ran it with    #
-- #  the placeholder? Change the password in Supabase → Authentication →      #
-- #  Users, or run:                                                           #
-- #      select public.revoke_admin('admin@test.com');                        #
-- ############################################################################

select public.create_admin_user('admin@test.com', 'admin123');


-- Useful later:
--   select email, created_at from public.admin_users order by created_at;
--   select public.grant_admin('someone@example.com');
--   select public.revoke_admin('someone@example.com');
