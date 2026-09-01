# Deployment

The site deploys to Vercel with no configuration. What takes a few extra minutes
is the contact form: a Supabase table, an SMTP account, and the environment
variables that connect them.

If you only want the front end, skip to
[Front end only](#front-end-only-no-database-no-email) — it needs no
environment variables at all.

---

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the three files in `supabase/migrations/`, in
   order. All are idempotent.

   | File | Creates |
   | --- | --- |
   | `0001_contact_submissions.sql` | The table, index, length limits, anonymous insert policy |
   | `0002_admin_auth.sql` | `admin_users`, `is_admin()`, the read/delete policies |
   | `0003_seed_admin_user.sql` | The `grant_admin` / `create_admin_user` helpers |

3. Create your admin — either in the Dashboard (Authentication → Users → Add
   user, "Auto Confirm User" ticked) followed by:

   ```sql
   select public.grant_admin('you@example.com');
   ```

   or in one statement:

   ```sql
   select public.create_admin_user('you@example.com', 'a-long-unique-password');
   ```

4. Turn off public signup: Authentication → Providers → Email → disable
   **Enable sign-ups**.
5. Project Settings → **API** → copy the **Project URL** and the **anon** key.

> There is no service-role key in this project, and you should not add one. The
> anon key is public by design — row-level security decides what it can read.

## 2. The lead notification email

The web app cannot send email. A Supabase Edge Function does, which is why no
SMTP credential appears in your host's environment.

```bash
supabase functions deploy notify-contact

supabase secrets set \
  SMTP_HOST=smtp.example.com \
  SMTP_PORT=465 \
  SMTP_USER=you@example.com \
  SMTP_PASS='app-password-not-your-account-password' \
  CONTACT_RECIPIENT_EMAIL=you@example.com \
  NOTIFY_WEBHOOK_SECRET="$(openssl rand -hex 32)"
```

Then Dashboard → **Database → Webhooks → Create a new hook**:

| Field | Value |
| --- | --- |
| Table | `contact_submissions` |
| Events | `Insert` only |
| Type | Supabase Edge Functions |
| Edge Function | `notify-contact` |
| HTTP Headers | `x-webhook-secret: <the value you generated>` |

That header is the only thing standing between the function and anyone who
learns its URL. Skip it and your SMTP account becomes an open relay.

Any provider works — Gmail with an **App Password**, Zoho, Resend, Mailgun,
Amazon SES. Port 465 is implicit TLS; 587 negotiates STARTTLS.

## 3. Auth emails

Password resets and invites are sent by Supabase, not by the app. Add your own
SMTP under Authentication → **SMTP Settings** (the built-in sender is
rate-limited and not for production), then paste the dark-themed templates from
`supabase/templates/` into Authentication → **Emails**.

## 4. Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo. The Next.js
   preset is detected; nothing to change.
3. **Settings → Environment Variables** → add the two values from
   [`.env.example`](../.env.example), for **Production**, **Preview** and
   **Development**.
4. Deploy.

Both are optional: the site deploys and runs without them. You just get the
setup panel at `/admin` until they are set.

### Custom domain

Vercel → **Settings → Domains** → add yours and follow the DNS instructions.
Then add `metadataBase: new URL("https://yourdomain.com")` to the `metadata`
object in `app/layout.tsx` so Open Graph image URLs resolve absolutely.

## Front end only (no database, no email)

Delete `app/api/contact/`, `app/admin/`, `app/api/admin/`, `lib/admin/`,
`supabase/` and `proxy.ts`, and point the contact form at a `mailto:` link or a
hosted form service. What is left is a static-friendly Next.js app that deploys
anywhere with zero environment variables.

## Other hosts

Nothing here is Vercel-specific. Any Node **20.9+** host works — Netlify,
Railway, Render, Fly.io, a VPS with `npm run build && npm run start`, or Docker
on `node:20-alpine`. The 3D scenes are client-only (`ssr: false`), so no host
needs a GPU. Email is sent by Supabase, not by the host, so there is no mail
transport to worry about either.

## Production checklist

- [ ] All three migrations run, in order
- [ ] `select email from public.admin_users;` returns your address
- [ ] Public signup disabled in Authentication → Providers → Email
- [ ] Both `NEXT_PUBLIC_` values set in the host's dashboard, not just local `.env`
- [ ] Edge Function deployed and its secrets set
- [ ] Webhook created, with the `x-webhook-secret` header
- [ ] Custom SMTP configured for auth emails, and the five templates pasted in
- [ ] `/admin` redirects to `/admin/login` when signed out
- [ ] A test submission appears in `/admin` **and** arrives by email
- [ ] `metadataBase` points at the live domain
- [ ] `npm run build` passes

Worth confirming, since the whole design rests on it:

```bash
# Should return nothing at all.
npm run build && grep -ri "service_role" .next/ | grep -v ".map"
```

## Troubleshooting

**`/admin` shows "Database not connected".** The two `NEXT_PUBLIC_` values are
missing or still hold `.env.example` placeholders. Environment changes need a
redeploy to take effect.

**Signed in, but "Not an admin".** The Supabase account is real; it has no
`admin_users` row. Run `select public.grant_admin('you@example.com');` — the
page shows the exact statement.

**Sign-in says "Invalid email or password" and you are sure it isn't.** Check the
user exists under Authentication → Users and is **confirmed**. An unconfirmed
user cannot sign in with a password.

**Created the user with SQL and it still can't log in.** The `auth.identities`
row is what password sign-in looks up. `create_admin_user` writes it; a
hand-written `insert into auth.users` alone does not.

**HTTP 429 on login.** Supabase's own sign-in rate limit. Wait a few minutes.

**The form saves but no email arrives.** Check `/admin` first. A row that is
present, with a "notification email was not delivered" warning, means SMTP —
not the form. `supabase functions logs notify-contact` has the reason. A row
present with *no* warning means the webhook never fired: check Database →
Webhooks.

**Login loops back to `/admin/login`.** The session cookie is being dropped.
Supabase auth cookies are `Secure` in production, so the site must be HTTPS.
