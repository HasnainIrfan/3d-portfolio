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

## Performance budget

Nothing that costs a device real work is allowed to mount on a device that
cannot afford it.

`hooks/use-deferred-3d.ts` is the single gate. Nothing it exports returns `true`
until the `load` event has fired and the browser has gone idle, and then only on
a viewport of 853px or wider, on a device reporting at least 4 cores and 4 GB of
memory, with `prefers-reduced-motion` unset. It exposes two gates:

- `useDeferredLayers()` covers the decorative parallax images in
  `components/portfolio/parallax-background.tsx`. They are ordinary images moved
  by composited transforms, so a wide viewport and some headroom is all they ask
- `useDeferred3D(stage)` additionally requires a **hardware** WebGL renderer, and
  orders the scenes. `components/sections/hero.tsx` takes stage 0 for the
  astronaut canvas; `components/globe/globe-layer.tsx` takes stage 1 and falls
  back to `globe-poster.tsx`, a CSS painted still built from the same `THEME`
  colours. Each stage waits for another idle callback, so two WebGL contexts,
  two renderers and two rounds of shader links never land in one long task

Because the gate returns `false` on the server and on first client render, the
`dynamic()` imports behind it never resolve on a phone, so three.js, drei and
postprocessing (876 KB) are never downloaded there. The particle field in the
contact section is gated separately by `use-in-view-once`.

### Software renderers

`hasHardwareWebGL()` reads `UNMASKED_RENDERER_WEBGL` and refuses SwiftShader,
llvmpipe and the other CPU rasterisers. A full-screen scene driven through one
of those spends seconds of main-thread time per frame: measured against a
SwiftShader build of the same page, the canvases alone accounted for 4.0-7.2s of
blocking time, which is what a lab run without a GPU reports as Total Blocking
Time. Those visitors get the painted fallback and the parallax landscape
instead, which is the same trade the site already makes on phones.

`failIfMajorPerformanceCaveat` is deliberately not used for this. It still hands
back a context under SwiftShader while rejecting some genuinely accelerated
setups, so the renderer name is the signal; a browser that hides that name for
fingerprinting reasons is trusted rather than downgraded.

### Frames nobody can see

There is no `repeat: Infinity` anywhere. An endless `motion` animation - the
hero's scroll indicator used to be one - keeps a `requestAnimationFrame`
callback registered for the life of the page, so the main thread never reaches
the idle state that Time to Interactive and Total Blocking Time are measured
against. That loop is now the `.scroll-hint-sweep` keyframe in `globals.css`,
which the compositor runs without waking JavaScript at all.

Note that Tailwind v4 compiles `-translate-x-1/2` to the standalone `translate`
property, not to `transform`, so a keyframe ending on `transform: none` composes
with it rather than replacing it. A keyframe that sets its own `translate(-50%)`
on top of the utility shifts the element twice.


`hooks/use-scene-active.ts` feeds `<Canvas frameloop>`. A scene pauses when the
tab goes to the background, and the hero canvas also pauses once it scrolls off
screen, so neither keeps a render loop and a postprocessing pass alive for a
viewport nobody is looking at.

The globe's bloom chain is built one idle callback after the canvas itself
(`hooks/use-globe-postprocessing.ts`), because constructing a pass links its
shader programs. Edge smoothing comes from the render target's MSAA rather than
an `SMAAEffect`, which used to decode two lookup textures and link three more
programs on the main thread while the page was trying to become interactive.
While the composer is still pending the hook renders the plain scene itself,
since taking priority 1 in the frame loop hands rendering over from
react-three-fiber.

The intro overlay in `page-loader.tsx` is CSS driven, not state driven. It
reveals and dismisses itself through the `.page-loader`, `.reveal` and `.intro-*`
animations in `globals.css`, so it plays and leaves on time even if hydration is
slow, and React only unmounts it afterwards. An inline script in the root layout
sets `data-intro-played` from `sessionStorage` before first paint, which hides it
outright on repeat visits within a session.

Above-the-fold copy in `hero-text.tsx` uses the same `.reveal` CSS animation
rather than `motion` variants. Anything with a `motion` `initial` prop ships as
`opacity: 0` in the server HTML and stays invisible until hydration, which puts
JavaScript on the critical path for the largest text on the page.

`flip-words.tsx` is the largest text on the page, which makes it the Largest
Contentful Paint element, and a rotating word is an unusual thing to hang that
metric on: every swap paints a fresh block, and any block larger than the last
one moves LCP later. It used to animate each letter in its own remounting
`motion.span`, which pushed LCP out by one interval on every rotation - measured
at 3.5s, then 6.5s, then 16.3s in a long enough session. The component now
stacks an invisible copy of every word in the one grid cell, so the row is
always as wide as the widest of them and no swap can reflow the hero. LCP
settles on the hero reveal, around 1.0s.

## The 3D layer

### The astronaut (`components/portfolio/astronaut.tsx`)

A GLB loaded with `useGLTF`, whose first embedded animation clip is played on
mount via `useAnimations`. Entry is a `motion` spring on `position.y` (from `2`
down to `-1`) applied inside `useFrame`, physics-driven rather than a fixed
`transition`, so it settles naturally regardless of how long the model took to
download. The drop is kept short because it is the largest moving object above
the fold, and Speed Index measures how long the viewport takes to stop changing.

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
