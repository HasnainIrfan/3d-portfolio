-- 0002 — the admin model.
--
-- Being signed in and being an admin are two different things, and this file
-- exists to keep them apart. Supabase Auth answers "is this a real user?".
-- public.admin_users answers "is this user allowed to read the enquiries?".
--
-- Without that separation, anyone who obtained an account on this project —
-- through a signup form, an invite meant for something else, an OAuth provider
-- you enable later — would be able to read every visitor's name, email address
-- and IP. The list below is the allowlist, and it can only be written from the
-- SQL editor.
--
-- Idempotent. Safe to re-run.

/* -------------------------------------------------------------------------- */
/*  The allowlist                                                             */
/* -------------------------------------------------------------------------- */

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Allowlist of Supabase users permitted to read contact submissions. Add rows with select public.grant_admin(''you@example.com'');';

-- Brings an admin_users table left over from an older revision up to the shape
-- the policies below expect, instead of silently skipping the create above and
-- failing later on a missing column.
alter table public.admin_users
  add column if not exists email      text,
  add column if not exists created_at timestamptz not null default now();

alter table public.admin_users enable row level security;

/* -------------------------------------------------------------------------- */
/*  is_admin()                                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Policies on admin_users                                                   */
/* -------------------------------------------------------------------------- */

-- An admin may see the admin list. Everyone else sees an empty table rather
-- than an error — which is exactly what the app relies on: it looks up its own
-- row and treats "no row" as "not an admin".
drop policy if exists "Admins can read the admin list" on public.admin_users;
create policy "Admins can read the admin list"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- Deliberately no insert, update or delete policy. Promoting an admin is a
-- thing you do in the SQL editor, on purpose, not something the application can
-- be talked into doing.

/* -------------------------------------------------------------------------- */
/*  Policies on contact_submissions                                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Clean-up from earlier versions of this project                            */
/* -------------------------------------------------------------------------- */

-- The very first version of this project kept admins in its own table with
-- bcrypt hashes it managed itself, and counted failed logins in another. Both
-- were replaced by Supabase Auth. Dropped here rather than in 0001 so that
-- re-running 0001 can never drop the allowlist created above.
drop function if exists public.verify_admin_credentials(text, text);
drop table if exists public.admin_login_attempts;
