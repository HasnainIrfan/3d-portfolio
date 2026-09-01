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
2. Open **SQL Editor**, paste the contents of
   `supabase/migrations/0001_contact_submissions.sql`, and run it.
   It creates `contact_submissions`, indexes it by date, and enables RLS with no
   policies. The script is safe to re-run.
3. Go to **Project Settings → API** and copy:
   - the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - the **anon** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> The service-role key bypasses row-level security. Keep it server-side, never
> give it a `NEXT_PUBLIC_` prefix, and rotate it immediately if it ever lands in
> a commit or a client bundle.

RLS on with no policies is intentional: the server reads through the
service-role key, and the anon key that *is* in the browser matches nothing.

## 2. SMTP

Any provider works — Gmail with an **App Password**, Zoho, Resend SMTP,
Mailgun, Amazon SES.

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `465` (implicit TLS) or `587` (STARTTLS) |
| `SMTP_USER` | The mailbox that sends |
| `SMTP_PASS` | App password or API key — **not** your account password |
| `CONTACT_RECIPIENT_EMAIL` | Where enquiries land. Optional; falls back to a hardcoded address in `app/api/contact/route.ts` — change that too |

## 3. Admin credentials

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the output as `ADMIN_SESSION_SECRET` (minimum 32 characters — a shorter one
makes the app throw rather than fall back to a default). Then set `ADMIN_EMAIL`
and `ADMIN_PASSWORD` to your single admin login.

## 4. Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo. The Next.js
   preset is detected; nothing to change.
3. **Settings → Environment Variables** → add every variable from
   [`.env.example`](../.env.example) that you filled in, for **Production**,
   **Preview** and **Development**.
4. Deploy.

**Miss this step and `/admin` sign-in fails in production even though it works
locally** — the environment is the only place the credential lives.

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
needs a GPU. The contact route sets `runtime = "nodejs"` because Nodemailer
needs it; an edge-only host will not run it.

## Production checklist

- [ ] Migration applied in Supabase
- [ ] Every variable set in the host's dashboard, not just in local `.env`
- [ ] `ADMIN_SESSION_SECRET` is 32+ random characters, unique to production
- [ ] `ADMIN_PASSWORD` is long and not reused from anywhere else
- [ ] Service-role key appears nowhere in the client bundle:
      `npm run build && grep -r "service_role" .next/static` returns nothing
- [ ] `/admin` redirects to `/admin/login` when signed out
- [ ] A test submission arrives in both the inbox and the `/admin` table
- [ ] `metadataBase` points at the live domain
- [ ] `npm run build` and `npm run lint` both pass

## Troubleshooting

**`/admin` login fails in production, works locally.** The variables were not
added to the host. Check `ADMIN_EMAIL`, `ADMIN_PASSWORD` and
`ADMIN_SESSION_SECRET`, then redeploy — environment changes need a new build.

**"ADMIN_SESSION_SECRET is missing or shorter than 32 characters."** Exactly
what it says. There is no fallback on purpose.

**HTTP 429 on login.** The throttle: 8 failures per IP per 15 minutes. It is
held in memory, so a redeploy clears it.

**The form submits but no email arrives.** The row is written to Supabase before
the email is sent, so check `/admin` first — a row present with no email means
SMTP, not the form. Port 465 vs 587 and app-password-vs-account-password are the
usual causes.

**Login loops back to `/admin/login`.** The session cookie is being dropped.
It is `Secure` in production, so the site must be served over HTTPS.
