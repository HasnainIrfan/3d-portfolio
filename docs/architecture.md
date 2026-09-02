# Architecture

How the pieces fit. Read this before changing anything structural, because several of
the decisions here look arbitrary until you know what they are avoiding.

## Project structure

Organised by *kind*, so anything you want to change has one obvious home. No
file is over ~250 lines.

Organised by *kind*, so anything you want to change has one obvious home.

```
app/
  layout.tsx              Root layout, fonts, full SEO metadata, JSON-LD
  sitemap.ts robots.ts    Generated from your own content
  manifest.ts icon.tsx    PWA manifest and generated favicons
  admin/                  Protected inbox: page, actions, login
  api/contact/route.ts    Validate → persist one row to Supabase

components/
  sections/               Thin page sections, composition only
  globe/ projects/ contact/ services/ about/ navbar/ admin/
  seo/                    JSON-LD structured data
  ui/                     Cross-section primitives
  portfolio/              Shared pieces: astronaut, particles, timeline, …

constants/                All copy, data and tuning, no strings in components
types/                    Every shared interface, one file per domain
hooks/                    Reusable behaviour (scroll, pointer, in-view, forms)
helpers/                  Pure functions (math, formatting, geometry, scroll)
animations/               Motion variants and springs
lib/                      supabase/ · admin/ · globe/ (GLSL sources)

proxy.ts                  Next 16's renamed middleware, gates /admin
supabase/
  migrations/0001_init.sql  The whole schema in one file
  functions/                notify-contact Edge Function
public/
  models/ assets/ og.jpg
```

## The render path

```
app/page.tsx  →  <HomePage />  (client)
                   ├─ <PageLoader />        full-screen cover during warm-up
                   ├─ <ThemedGlobe />       WebGL, fixed, z-0
                   └─ <div class="relative z-10">
                        Navbar · Hero · About · Services · Projects
                        Experiences · Testimonial · Contact · Footer
```

`Hero` and `ThemedGlobe` are pulled in with `dynamic(..., { ssr: false })`.
Both mount a `<Canvas>`, and WebGL has no server equivalent, so importing them
statically would break the build's server pass and ship their Three.js chunk in
the initial bundle either way.

**The `z-10` wrapper is load-bearing.** The globe renders at `z-0` behind
everything. Sections are `relative` with no `z-index` of their own, so without
that wrapper they interleave with the globe in paint order and it punches
through the middle of the page. Lifting the content into its own stacking
context is what pins the globe behind it.

## The 3D layer

### The astronaut (`components/portfolio/astronaut.tsx`)

A GLB loaded with `useGLTF`, whose first embedded animation clip is played on
mount via `useAnimations`. Entry is a `motion` spring on `position.y` (from `5`
down to `-1`) applied inside `useFrame`, physics-driven rather than a fixed
`transition`, so it settles naturally regardless of how long the model took to
download.

The camera follows the pointer through a `Rig` component that calls
`easing.damp3` from `maath` each frame: damping, not lerp, so the motion is
frame-rate independent.

Below 853px (`useMediaQuery`) the model scales to `0.23` and drops to
`[0, -1.5, 0]`, which keeps it clear of the headline instead of rendering the
desktop framing and letting it crop.

### The shader globe (`components/portfolio/themed-globe.tsx`)

The most involved file in the repo, and self-documenting. Its header comment
explains every deviation from the demo it was ported from. In short:

- 3,000 capsules are instanced onto a Fibonacci sphere, each rotated so its flat
  end faces outward. **One instanced draw call** for the whole surface.
- Four orbs orbit on tilted planes. Every spike measures its inverse-square
  distance to each orb; the nearest one presses that spike toward the core, so
  the orbs carve travelling craters. All of it runs in the vertex shader.
- Lighting is analytic: fresnel/spec glass plus an aqua rim light, no matcap
  and no noise texture, which is two texture fetches the original demo paid for
  and this one does not.
- Shadow mapping is replaced by a `smoothstep` on N·L. The demo's
  `customDepthMaterial` setup throws inside `postprocessing`'s composer on three
  r184, and the terminator is the only thing it bought.
- A single `BloomEffect` pass runs through an `EffectComposer` with
  multisampling off.

**Scroll choreography:** one keyframe per section, reached when that section is
centred, joined by a Catmull-Rom spline and chased by critically damped springs
(`useGlobePath` + the local `damp` helper). Adding a section means adding a
keyframe.

### Particles (`components/portfolio/particles.tsx`)

Not Three.js, but a 2D canvas layer behind the contact section. Circles drift, fade
between an alpha and a target alpha, and lean toward the pointer by their own
`magnetism` factor. The maths lives in `helpers/particles-helpers.ts` so the
component stays a renderer.

## Content and data

Every string, project, testimonial and skill on the page comes from
`constants/portfolio-constants.ts`, typed against `types/portfolio-types.ts`.
No component holds copy. This is what makes forking cheap. See
[`customization.md`](customization.md).

`STATS` is hand-written copy, not derived from `MY_PROJECTS.length`. If you add
or remove projects, update the numbers yourself.

## Contact form → inbox

```
<Contact />
   └─ POST /api/contact          app/api/contact/route.ts   (runtime: nodejs)
        ├─ validate name / email / message, regex-check the address
        └─ insert one row into contact_submissions, using the anon key

contact_submissions INSERT
   └─ Database Webhook → supabase/functions/notify-contact  (Deno)
        ├─ acknowledgement to the visitor      (sent first, failure isolated)
        ├─ the lead to you, Reply-To: visitor
        └─ write email_sent / email_error back onto the row
```

The route no longer sends email. It used to, with Nodemailer, which meant SMTP
credentials in the web deployment and a mail library in the server bundle.
Moving that to an Edge Function left the route as a single validated write, and
left the repository with no credential to leak.

The insert deliberately does not `.select()` the row back. The `anyone can
submit` policy grants INSERT and nothing else, so asking for the inserted row
would make PostgREST refuse the whole statement.

## Auth

Two questions, kept apart, because conflating them is how a portfolio leaks its
visitors' contact details:

| Question | Answered by |
| --- | --- |
| Are you a real user on this project? | Supabase Auth |
| Are you allowed to read the enquiries? | A row in `public.admin_users` |

`lib/admin/auth.ts` resolves both into one `AdminState` (`admin`,
`signed-out`, `not-admin`, or `not-configured`), memoized with React's `cache`
so a layout, a page and an action can each ask without repeating the round trip.

It calls `getUser()`, never `getSession()`. `getSession()` decodes whatever is
in the cookie and trusts it; `getUser()` revalidates the token against the auth
server. That is the difference between a check and a formality.

### Enforced three times

1. **`proxy.ts`:** bounces requests with no session before a page renders.
2. **`getAdminState()`** in the page and in every Server Action. Next.js exposes
   Server Actions as endpoints reachable by direct POST, so this is not a
   repetition of the proxy's work.
3. **Row-level security.** Nothing in this project uses a service-role key, so
   the policies are the actual enforcement rather than a second opinion on top
   of a client that bypasses them. A bypassed UI check returns zero rows.

### The proxy has a second job

Supabase access tokens are short-lived, and Server Components cannot write
cookies. If the refreshed token pair is not written back in `proxy.ts` it is
written back nowhere, and the symptom is an admin who gets logged out at
seemingly random intervals, with nothing in the logs. The `getUser()` call there
is what triggers the refresh; it is not a redundant check.

On redirect, the refreshed cookies are copied onto the redirect response by
hand. Miss that and the new tokens are dropped, so the next request starts from
an expired session again.

## What replaced what

| Was | Now |
| --- | --- |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD` in the environment | Supabase Auth users + an `admin_users` allowlist |
| Hand-rolled HMAC session cookie (`lib/admin/session.ts`) | Supabase session cookies with refresh rotation |
| In-memory login throttle (`lib/admin/throttle.ts`) | Supabase's own sign-in rate limiting, shared across instances |
| `SUPABASE_SERVICE_ROLE_KEY` reads that bypass RLS | Every query runs as the caller, under RLS |
| Nodemailer + four SMTP variables | `notify-contact` Edge Function, secrets held in Supabase |

Eight environment variables became two, and both are public.

## Database

One idempotent file, `supabase/migrations/0001_init.sql`.

**`contact_submissions`:** every enquiry. RLS with a deliberate asymmetry:

| Role | May |
| --- | --- |
| `anon`, `authenticated` | INSERT only. A visitor cannot read back even their own row |
| admins (`is_admin()`) | SELECT, DELETE |
| anyone | *never* UPDATE. An enquiry is a record of what someone actually wrote |

CHECK constraints bound every field's length. The insert policy is open to
anonymous callers, so the REST endpoint is reachable directly with the public
anon key; those bounds are what stop a direct caller writing megabytes.

**`admin_users`:** the allowlist. Readable by admins, and writable by nobody:
there is no insert, update or delete policy at all. Promotion happens in the SQL
editor through `grant_admin()`, whose EXECUTE is revoked from `anon` and
`authenticated` so it cannot be reached over RPC. Without that revoke, any
signed-up user could promote themselves.

**`is_admin()`** is `security definer` for a specific reason. The policies call
it, and it reads `admin_users`, which has RLS. Evaluated as the caller, that
recurses: the policy asks the function, the function triggers the policy, and
Postgres raises "infinite recursion detected in policy". Running as the definer
reads the table without RLS and breaks the cycle. Its `search_path` is pinned so
a caller who can create objects cannot shadow `admin_users` with their own.

## Degrading without a database

`lib/supabase/config.ts` answers one question, `isSupabaseConfigured`, and
never throws. It also rejects the placeholder values from `.env.example`, so a
half-finished setup shows the setup panel rather than a DNS failure.

Everything downstream branches on it: `createClient()` returns `null`, the
contact route answers 503 with an address to write to instead, `/admin` renders
`components/admin/setup-notice.tsx`, and the proxy lets requests through rather
than redirecting to a login page that could not work either.

A fork with an empty `.env` builds, deploys and runs. That is a supported state,
not an error, and nothing logs red about it.

## Styling

Tailwind CSS v4, configured CSS-first. The palette and the orbit keyframes live
in an `@theme` block at the top of `app/globals.css`; there is no
`tailwind.config.js`. Class merging goes through `tailwind-merge`.
