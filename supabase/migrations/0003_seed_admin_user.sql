-- 0003 — creating your first admin.
--
-- Two helper functions, then one line to run. Both functions are locked to the
-- SQL editor: EXECUTE is revoked from every application role, so neither is
-- reachable over the API. If `authenticated` could call grant_admin, any user
-- who signed up could promote themselves and read every enquiry.
--
-- Idempotent. Safe to re-run.

/* -------------------------------------------------------------------------- */
/*  grant_admin — promote an existing Supabase user                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  revoke_admin — the other direction                                        */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  create_admin_user — create the account and promote it in one step         */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Now run one of these                                                      */
/* -------------------------------------------------------------------------- */

-- A. You already created the user in the Dashboard (recommended):
--
--      select public.grant_admin('you@example.com');
--
-- B. Create the account and promote it in one go. Change both values, and
--    change the password again from /admin after your first sign-in:
--
--      select public.create_admin_user('you@example.com', 'a-long-unique-password');
--
-- Check who has access at any time:
--
--      select email, created_at from public.admin_users order by created_at;
