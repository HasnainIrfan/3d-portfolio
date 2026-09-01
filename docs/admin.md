# The admin inbox

A private page at `/admin` listing everything sent through the contact form.
Sign-in is Supabase Auth; who counts as an admin is a row in a table you control
from the SQL editor.

**There are no secrets in this application.** No admin password, no session
signing key, no service-role key, no SMTP credentials. The whole deployment is
two public values:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Both are optional. With neither set, the portfolio runs normally and `/admin`
shows a short setup panel instead of failing.

---

## How access works

Two questions, kept deliberately separate:

| Question | Answered by |
| --- | --- |
| Are you a real user on this project? | Supabase Auth |
| Are you allowed to read the enquiries? | A row in `public.admin_users` |

Conflating them is the mistake this design exists to avoid. If "signed in"
implied "admin", then anyone who ever obtained an account on the project — a
signup you left open, an invite meant for something else, an OAuth provider you
enable next year — could read every visitor's name, email address and IP.

`admin_users` has no insert, update or delete policy. **Nothing the application
can be tricked into doing will add an admin.** Promotion happens in the SQL
editor, on purpose.

### Enforced in three places

1. **`proxy.ts`** — bounces requests with no session before a page renders, and
   refreshes the Supabase token on the way through.
2. **The page and every Server Action** — `getAdminState()` re-checks, because
   Server Actions are reachable by direct POST regardless of what the proxy did.
3. **Row-level security** — the `admins can select / delete` policies. Since
   nothing here uses a service-role key, this is not a second opinion on top of
   a privileged client; it is the actual enforcement. A bypassed UI check
   returns zero rows.

---

## Setup

### 1. Run the SQL

Supabase Dashboard → **SQL Editor**. Paste
`supabase/migrations/0001_init.sql` and run it. That is the whole schema — one
file, idempotent, safe to re-run.

It creates:

| | |
| --- | --- |
| `contact_submissions` | The table every enquiry lands in, with its index and length limits |
| `admin_users` | The allowlist of people who may read it |
| `is_admin()` | The check every policy calls |
| The policies | Anonymous insert; admin select and delete; no update for anyone |
| `grant_admin()` and friends | How you add and remove admins |

### 2. Change the placeholder login

The file creates your admin account for you, using the two values in **section
6** at the bottom:

```sql
select public.create_admin_user('admin@test.com', 'admin123');
```

**Change both before you run it.** They are a placeholder so the file works out
of the box, and this repository is public — anyone who reads it knows them. Left
as they are, a stranger can sign in at `/admin` and read every visitor's name,
email address and IP.

Already ran it with the placeholder? Change the password under Supabase →
Authentication → Users, or drop the account's access with:

```sql
select public.revoke_admin('admin@test.com');
```

Adding another admin later: create the user in the Dashboard (Authentication →
Users → Add user, "Auto Confirm User" ticked), then

```sql
select public.grant_admin('them@example.com');
```

`create_admin_user` writes to `auth.users` and `auth.identities` directly, which
is a shortcut worth knowing about — those tables belong to Supabase's auth
service and their shape can change between releases. The Dashboard route is the
more durable one for accounts you add later.

### 3. Connect the app

Project Settings → API. Copy the **Project URL** and the **anon** key into
`.env`, and into your host's environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

The anon key is **not** a secret. It identifies the project; RLS decides what it
can reach. Shipping it to browsers is the intended design.

### 4. Turn off public signup

Dashboard → Authentication → Providers → Email → **disable "Enable sign-ups"**.
An account with no `admin_users` row already sees nothing, but there is no
reason to let strangers create one.

Then sign in at `/admin/login`.

---

## Lead notification emails

The app does not send email. A Supabase Edge Function does, so the SMTP
credentials live in Supabase and never touch this repository or your web host.

```
INSERT on contact_submissions
  → Database Webhook
    → notify-contact Edge Function
      → acknowledgement to the visitor
      → the lead to you (Reply-To: the visitor)
      → writes email_sent / email_error back to the row
```

### Deploy it

```bash
supabase functions deploy notify-contact

supabase secrets set \
  SMTP_HOST=smtp.example.com \
  SMTP_PORT=465 \
  SMTP_USER=you@example.com \
  SMTP_PASS='app-password-not-your-account-password' \
  CONTACT_RECIPIENT_EMAIL=you@example.com \
  OWNER_NAME="Your Name" \
  SITE_URL=https://yoursite.com \
  NOTIFY_WEBHOOK_SECRET="$(openssl rand -hex 32)"
```

Keep that last value — the webhook has to send it back.

### Wire up the webhook

Dashboard → **Database → Webhooks → Create a new hook**:

| Field | Value |
| --- | --- |
| Table | `contact_submissions` |
| Events | `Insert` only |
| Type | Supabase Edge Functions |
| Edge Function | `notify-contact` |
| HTTP Headers | `x-webhook-secret: <the value you generated>` |

**That header is what protects the function.** Without it, anyone who discovers
the URL can post a payload and make your SMTP account send mail from your
domain. The function logs a warning and runs unprotected if the secret is unset,
rather than silently pretending to be secure.

### What gets sent

Two emails per enquiry, both from `supabase/functions/notify-contact/email-template.ts`
— the only email templates in this project:

| To | What it says |
| --- | --- |
| **The visitor** | A short acknowledgement: their message arrived, you read them yourself, expect a reply within a business day. Includes a copy of what they wrote. |
| **You** | The lead — name, email, budget, message, timestamp — with `Reply-To` set to the visitor, so replying answers them. |

The acknowledgement is sent first, and its failure is caught separately. A typo
in the visitor's address must not stop the lead reaching you.

Set `OWNER_NAME` and `SITE_URL` alongside the SMTP secrets so the
acknowledgement signs off with your name and can link back to your work.

### Auth emails

Password resets and invites are sent by Supabase itself, using whatever SMTP you
configure under Authentication → **SMTP Settings**. The built-in sender is
rate-limited and not meant for production, so add your own there too.

Those emails use Supabase's default styling. This project ships no templates for
them — with one admin who rarely resets a password, custom branding on a
password-reset email is not worth the five files it costs. Restyle them in the
Dashboard if you ever want to.

---

## Living with it

**Forgot the password.** `/admin/login` → Supabase sends a reset through the
template above. There is no password in any config file to look up any more.

**A second admin.** Invite them (Authentication → Users → Invite), then
`select public.grant_admin('them@example.com');`.

**Signed in but told "Not an admin".** The account is real; it has no
`admin_users` row. The page shows the exact SQL to fix it.

**Locked out by rate limiting.** Supabase enforces sign-in limits at the auth
server. Wait a few minutes. (The previous version counted failures in memory,
which on serverless meant every instance counted separately — one of several
reasons this moved to Supabase Auth.)

**A lead never emailed.** Check `/admin` first. The row is written by the app and
the email is sent by the Edge Function afterwards, so an enquiry present in the
list with a "notification email was not delivered" warning is an SMTP problem,
not a form problem. `supabase functions logs notify-contact` has the detail.

---

## What this replaced

The first version kept an `admin_users` table with bcrypt hashes it managed
itself. The second moved to `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the environment,
with a hand-rolled HMAC session cookie and an in-memory login throttle.

Both worked. Supabase Auth brings password hashing, refresh-token rotation,
shared rate limiting and password reset that a portfolio has no business
implementing itself — and it removed four secrets (`ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) plus the
four SMTP variables from the deployment.
