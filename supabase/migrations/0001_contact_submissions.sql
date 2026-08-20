-- The only migration this project needs.
-- Run it once in the Supabase Dashboard → SQL Editor. Safe to re-run.
--
-- One table: every contact-form submission lands here, and /admin reads it.
-- There is no admin table — the single admin login lives in the environment
-- (ADMIN_EMAIL / ADMIN_PASSWORD). See docs/admin.md.

create extension if not exists "pgcrypto";

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  budget      text,
  message     text not null,
  source      text default 'portfolio',
  user_agent  text,
  ip_address  text,
  created_at  timestamptz not null default now()
);

-- The admin list is always ordered newest-first, and the dashboard counts rows
-- in a trailing 7-day window; both read straight off this index.
create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- RLS on with no policies at all.
--
-- In Supabase the service_role key bypasses RLS, so the server — which is the
-- only thing that ever touches this table — keeps full access. The anon key,
-- which is safe to ship to browsers, matches no policy and therefore sees
-- nothing. Adding an anon policy here would publish every visitor's name,
-- email address and IP, so don't.
alter table public.contact_submissions enable row level security;

-- Clean up the service_role policies an earlier version of this file created.
-- They were never load-bearing (service_role bypasses RLS regardless).
drop policy if exists "Service role can write" on public.contact_submissions;
drop policy if exists "Service role can read"  on public.contact_submissions;

-- Remove the admin tables and function from the previous auth scheme, if the
-- old 0002_admin_auth.sql was ever applied to this project.
drop function if exists public.verify_admin_credentials(text, text);
drop table    if exists public.admin_login_attempts;
drop table    if exists public.admin_users;

/* -------------------------------------------------------------------------- */
/*  Notification-email status                                                 */
/* -------------------------------------------------------------------------- */

-- Saving the row and sending the notification email are separate steps, and the
-- email is the one that fails: SMTP providers rate limit, credentials expire.
-- The send is deliberately non-fatal — a message you can read in /admin beats a
-- 500 shown to the visitor — but without these columns that failure was silent,
-- and the first sign of it was noticing no email had arrived in weeks.
--
-- Nullable on purpose, three states rather than two:
--   null  — saved before this column existed, or still in flight. Unknown.
--   true  — the SMTP server accepted it.
--   false — the send failed; email_error says why.
alter table public.contact_submissions
  add column if not exists email_sent  boolean,
  add column if not exists email_error text;
