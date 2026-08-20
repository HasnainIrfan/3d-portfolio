# Admin panel

A password-protected page at `/admin` listing everything submitted through the
contact form. Read-only: it shows submissions, it does not edit them.

The whole thing rests on two pieces:

- **One table** — `contact_submissions`. It is the only table in the project.
- **One credential** — `ADMIN_EMAIL` + `ADMIN_PASSWORD`, held in the
  environment. There is no accounts table, no user rows, nothing to seed.

## One-time setup

### 1. Apply the migration

Open the Supabase dashboard → **SQL Editor**, paste the contents of
`supabase/migrations/0001_contact_submissions.sql`, and run it. It creates
`contact_submissions`, indexes it by date, and turns on RLS with no policies —
the server's service-role key bypasses RLS, and the browser-safe anon key
matches nothing, so the table is unreadable from the client.

The script is safe to re-run, and it also drops the `admin_users` /
`admin_login_attempts` tables and `verify_admin_credentials()` function from the
older database-backed login, if you ever applied those.

### 2. Set the environment variables

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | The one admin address. Matched case-insensitively. |
| `ADMIN_PASSWORD` | The one admin password. Matched exactly. |
| `ADMIN_SESSION_SECRET` | Signs the login cookie. Min 32 chars. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access. Never expose to the browser. |

All five are already in your local `.env`. **Add them to your hosting provider's
environment too** (Vercel → Settings → Environment Variables) or sign-in fails in
production. Generate the session secret with:

```bash
openssl rand -base64 48
```

Pick a long, unique password — this login exposes every visitor's name, email
address and IP.

**Changing the password** is a matter of editing `ADMIN_PASSWORD` and
redeploying. **Revoking every active session** is changing `ADMIN_SESSION_SECRET`
instead, which invalidates all signed cookies immediately.

Until `ADMIN_EMAIL` and `ADMIN_PASSWORD` are both set, signing in returns a 503
saying exactly that — it will not look like a wrong password.

## Using it

Go to `/admin`. Unauthenticated visitors are redirected to `/admin/login`.

- **Search** matches name, email and message body.
- **Pagination** is 25 per page, newest first.
- **Metadata** on each card expands to show IP, user agent and submission ID —
  useful for judging whether something is spam.
- **Delete** sits at the bottom right of each card. The first click arms it, the
  second confirms. There is no undo — the row is gone from the database.
- **A red banner** on a card means the notification email for it never went out.
  The SMTP server's own reply is quoted, so you can tell a rate limit from a bad
  password. See *No email arriving* below.

## How the security works

Two independent checks guard the page:

1. `proxy.ts` verifies the cookie's HMAC signature on every `/admin/*` request
   and redirects to the login if it is missing, expired or forged. It touches no
   database, because a proxy runs on every matched request including prefetches.
2. `app/admin/page.tsx` calls `getAdminSession()` again before reading anything.
   This is the one that actually matters — it holds even if the proxy matcher is
   later changed.

Other properties worth knowing:

- The session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
  It carries a signature, not a password, and expires after 8 hours.
- Both the credential check and the cookie-signature check are constant-time, so
  neither leaks how much of a guess was correct.
- Wrong email and wrong password return the identical message, so the login
  cannot be used to confirm the admin address.
- 8 failed attempts from one IP in 15 minutes are refused. The counter is held
  in memory rather than in a table — on a serverless host that means per
  instance, which blunts a script hammering one instance but is not a global
  limit. Ceding that was the price of getting down to a single table.
- The `/admin` route sets `robots: noindex, nofollow`.
- Search input is stripped to `[a-zA-Z0-9@._- ]` before it reaches PostgREST,
  whose `or=(...)` filter is a string grammar and would otherwise be injectable.

## No email arriving

Saving the submission and emailing you about it are two separate steps, and only
the first one is allowed to fail loudly. If the email step fails, the visitor
still gets a success message and the message is still in `/admin` — that is
deliberate, since the alternative is losing enquiries to a mail outage.

The cost of that choice is that a broken mailer is silent. So each submission now
records whether its email went out, and `/admin` shows a red banner with the
SMTP error on any that did not.

To find out what is wrong, check that banner first, then work down this list:

1. **`550-5.4.5 Daily user sending limit exceeded`** — Gmail has cut off the
   sending account. A free Gmail account allows roughly 500 messages a day via
   SMTP, and Google applies much tighter limits to accounts it thinks are being
   used to send in bulk. The limit lifts on a rolling 24-hour basis. If it keeps
   recurring, the account is being used for something else too, and the portfolio
   should not share it — move to a transactional provider.
2. **`535 Username and Password not accepted`** — the app password was revoked,
   or `SMTP_PASS` has been pasted without its spaces. Gmail app passwords are 16
   characters shown in four groups; either form works, but a truncated one does
   not.
3. **`SMTP is not configured on this deployment`** — `SMTP_HOST`, `SMTP_USER` or
   `SMTP_PASS` is missing from that environment. This is the usual production
   cause: the variables exist in your local `.env` but were never added to
   Vercel, so mail works on localhost and silently does nothing once deployed.
4. **No banner at all, and still no email** — the send succeeded and the problem
   is delivery. Check spam. Mail sent through a personal Gmail account with a
   `from` address that visitors do not recognise is a common spam classification.

`CONTACT_RECIPIENT_EMAIL` controls where enquiries go; it falls back to a
hardcoded address in `app/api/contact/route.ts` if unset.

For anything more than an occasional enquiry, a transactional email provider
(Resend, Postmark, SES) is the real fix. They are built for application mail,
they do not have a personal daily quota, and they report bounces instead of
silently dropping messages.

## Things this deliberately does not do

- **No account creation, no second admin.** One operator, one credential. A
  signup form on an admin panel is a liability with no upside here.
- **No edit.** You can delete a submission, but not rewrite one — an editable
  record of who contacted you is worth less than an honest one.
- **No undo on delete.** No soft-delete flag, no recycle bin. A list this small
  does not justify a column every future query has to remember to filter on.
- **No password reset by email.** Change `ADMIN_PASSWORD` and redeploy.
