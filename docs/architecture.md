# Architecture

How the pieces fit. Read this before changing anything structural — several of
the decisions here look arbitrary until you know what they are avoiding.

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
Both mount a `<Canvas>`, and WebGL has no server equivalent — importing them
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
down to `-1`) applied inside `useFrame` — physics-driven rather than a fixed
`transition`, so it settles naturally regardless of how long the model took to
download.

The camera follows the pointer through a `Rig` component that calls
`easing.damp3` from `maath` each frame — damping, not lerp, so the motion is
frame-rate independent.

Below 853px (`useMediaQuery`) the model scales to `0.23` and drops to
`[0, -1.5, 0]`, which keeps it clear of the headline instead of rendering the
desktop framing and letting it crop.

### The shader globe (`components/portfolio/themed-globe.tsx`)

The most involved file in the repo, and self-documenting — its header comment
explains every deviation from the demo it was ported from. In short:

- 3,000 capsules are instanced onto a Fibonacci sphere, each rotated so its flat
  end faces outward. **One instanced draw call** for the whole surface.
- Four orbs orbit on tilted planes. Every spike measures its inverse-square
  distance to each orb; the nearest one presses that spike toward the core, so
  the orbs carve travelling craters. All of it runs in the vertex shader.
- Lighting is analytic — fresnel/spec glass plus an aqua rim light, no matcap
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

Not Three.js — a 2D canvas layer behind the contact section. Circles drift, fade
between an alpha and a target alpha, and lean toward the pointer by their own
`magnetism` factor. The maths lives in `helpers/particles-helpers.ts` so the
component stays a renderer.

## Content and data

Every string, project, testimonial and skill on the page comes from
`constants/portfolio-constants.ts`, typed against `types/portfolio-types.ts`.
No component holds copy. This is what makes forking cheap — see
[`customization.md`](customization.md).

`STATS` is hand-written copy, not derived from `MY_PROJECTS.length`. If you add
or remove projects, update the numbers yourself.

## Contact form → inbox

```
<Contact />
   └─ POST /api/contact          app/api/contact/route.ts   (runtime: nodejs)
        ├─ validate name / email / message, regex-check the address
        ├─ escape every field for HTML
        ├─ insert into Supabase `contact_submissions` (service-role key)
        └─ send an SMTP notification via Nodemailer
```

Both sides are best-effort independent: a mail failure should not lose the
submission, which is exactly why the row is written before the email is sent.

## Admin auth

Two files carry the model, and both explain themselves in comments worth
reading:

- **`lib/admin/session.ts`** — the cookie is
  `base64url(payload).base64url(hmacSha256(payload))`. Stateless, so it verifies
  with no database round trip. Deliberately **not** a JWT: no dependency, and no
  `alg` field that has to be validated to dodge the `alg: none` class of bug.
  The signature is compared with `timingSafeEqual` after a length check, because
  `===` leaks how much of the signature was right. Eight-hour lifetime.
  `getAdminSession()` is wrapped in React's `cache` so several components can
  call it without repeating the HMAC.
- **`lib/admin/throttle.ts`** — 8 failures per key per 15-minute rolling window,
  capped at 5,000 tracked keys with oldest-first eviction. The trade-off is
  stated plainly in the file: on serverless, each instance counts separately.

**`ADMIN_SESSION_SECRET` has no fallback.** A missing or short secret throws
rather than defaulting, because a hardcoded default in a public repo is a
skeleton key.

`proxy.ts` (Next 16's renamed `middleware.ts`) gates `/admin` on the Node
runtime, so it can verify the signature rather than merely check that a cookie
exists. It does no database work — it runs on prefetches too — so the pages
re-verify through `getAdminSession()` before reading anything.

`app/admin/layout.tsx` sets `robots: { index: false, follow: false }`. The page
lists visitors' names, emails and IPs.

## Database

One table, `contact_submissions`, created by
`supabase/migrations/0001_contact_submissions.sql`. RLS is **on with no
policies**: the server's service-role key bypasses RLS, and the browser-safe
anon key therefore matches nothing. There is no accounts table — the single
admin credential lives in the environment.

## Styling

Tailwind CSS v4, configured CSS-first. The palette and the orbit keyframes live
in an `@theme` block at the top of `app/globals.css`; there is no
`tailwind.config.js`. Class merging goes through `tailwind-merge`.
