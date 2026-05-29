-- Run this once in the Supabase Dashboard → SQL Editor.
-- Creates the table that the portfolio contact form writes to.

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

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Drop any prior policy with the same name so this script is re-runnable.
drop policy if exists "Service role can write" on public.contact_submissions;
drop policy if exists "Service role can read" on public.contact_submissions;

create policy "Service role can write"
  on public.contact_submissions
  for insert
  to service_role
  with check (true);

create policy "Service role can read"
  on public.contact_submissions
  for select
  to service_role
  using (true);
