-- 0001 — the contact_submissions table.
--
-- Run the files in this directory in order, in the Supabase Dashboard →
-- SQL Editor. Every one of them is idempotent: re-running is always safe.
--
--   0001  this file — the table every enquiry lands in
--   0002  the admin model: who is allowed to read the table
--   0003  creating your first admin user
--
-- Design note. There is no service-role key anywhere in the application, so
-- these policies are not a second opinion on top of some privileged client —
-- they are the only thing standing between a visitor and this data.

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
  created_at  timestamptz not null default now(),

  -- Written by the notify-contact Edge Function after it tries to send the
  -- alert. null means "never attempted", which is not the same as a failure —
  -- /admin only shows a warning for an explicit false.
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

-- Length limits, enforced in the database rather than only in the route
-- handler. The insert policy below is open to anonymous callers, so the API is
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

-- Anyone may submit the form. INSERT only: there is no accompanying select
-- policy for anon, so a visitor can add a row and can never read one back —
-- not even the one they just wrote. That is why the API route does not ask
-- for the inserted row with .select().
drop policy if exists "Anyone can submit the contact form" on public.contact_submissions;
create policy "Anyone can submit the contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Reading and deleting are granted in 0002, once there is an admin model to
-- grant them to. Nothing can read this table until then.
