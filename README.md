<div align="center">

# 3D Developer Portfolio — Next.js 16 · React Three Fiber · Three.js · Tailwind CSS v4

**An interactive, animated 3D portfolio website for developers** — a GLTF astronaut floating in a WebGL canvas, a GPU shader globe that flies down the page as you scroll, magnetized particles, scroll-driven motion, a working contact form and a private admin inbox. Built with Next.js 16 (App Router), React 19, TypeScript, Three.js and Tailwind CSS v4.

[**Live Demo →**](https://hasnaindeveloper.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9-black?logo=react&logoColor=61DAFB)](https://r3f.docs.pmnd.rs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)

<br />

[![3D developer portfolio built with Next.js, Three.js and React Three Fiber — animated astronaut hero section](docs/images/screenshot.jpg)](https://hasnaindeveloper.vercel.app)

<sub><i>The hero section — a GLTF astronaut floating over parallax alien terrain. The shader globe takes over as you scroll.</i></sub>

</div>

---

## Table of contents

- [What this is](#what-this-is)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Make it your own](#make-it-your-own)
- [Deployment](#deployment)
- [Performance notes](#performance-notes)
- [Documentation](#documentation)
- [Credits & asset licensing](#credits--asset-licensing)
- [License](#license)

---

## What this is

A production portfolio site, not a demo. It is the code behind
[hasnaindeveloper.vercel.app](https://hasnaindeveloper.vercel.app) — the personal
site of **Hasnain Irfan**, a software engineer building web and mobile products
with React, Next.js, React Native and Node.js.

It is also a **reusable 3D portfolio template**. Every piece of copy — name,
role, projects, services, experience, testimonials, skills, socials — lives in a
single typed constants file, so you can fork this repo and have your own site
running without touching a component. See [Make it your own](#make-it-your-own).

## Features

**3D & WebGL**
- **Floating astronaut** — a GLTF/GLB model animated with `useGLTF` + `useAnimations`, mouse-reactive camera rig with damped easing, and a spring-driven entrance.
- **Shader globe** — 3,000 capsules instanced onto a Fibonacci sphere in **one draw call**, with four orbiting orbs that carve travelling craters into the surface via inverse-square displacement computed entirely in the vertex shader. Analytic fresnel glass, an aqua rim light and a bloom pass from [`postprocessing`](https://github.com/pmndrs/postprocessing).
- **A globe that flies down the page** — one keyframe per section, joined by a Catmull-Rom spline and chased by critically damped springs, so the globe travels with your scroll instead of cutting between positions.
- **Mouse-magnetized particle field** — a 2D canvas layer behind the contact section whose particles drift, fade and lean toward the cursor.
- **Mobile-aware scenes** — the 3D canvas rescales and repositions below 853px so the astronaut never fights the copy for space.
- A drop-in [COBE](https://cobe.vercel.app) marker globe (`components/portfolio/globe.tsx` + `constants/globe-constants.ts`) also ships with the repo if you want the lighter, cheaper option.

**Motion & UI**
- Scroll-driven section reveals and layout transitions with [Motion](https://motion.dev) (Framer Motion's successor).
- Parallax mountain/sky background layers that respond to pointer movement.
- Flip-word headline, marquee logo strip, orbiting-circles skill cloud, animated vertical experience timeline.
- Project cards with a detail modal, copy-to-clipboard email button, and toast alerts.
- A full-screen page loader that hides the layout shift while the WebGL scenes warm up.
- Responsive from 320px up, keyboard-navigable, with `prefers-color-scheme`-aware browser chrome theming.

**Backend & content**
- **Contact form** → validated Route Handler that persists the enquiry to Supabase **and** sends an SMTP notification via Nodemailer, with HTML escaping on every field.
- **Private admin inbox at `/admin`** — stateless HMAC-signed session cookie (deliberately not a JWT), enforced twice: once in `proxy.ts` (Next 16's renamed middleware, on the Node runtime) and again in the page itself. Credentials live in environment variables, so there is no accounts table to seed. In-memory login throttling caps failures at 8 per IP per 15 minutes → HTTP 429. Submissions can be deleted from the UI.
- **Supabase** with row-level security on and no policies: the service-role key reads server-side, the anon key matches nothing in the browser.
- **SEO ready** — typed `metadata` with keywords and Open Graph tags, a Web App Manifest, and dynamically generated `icon` / `apple-icon` routes.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) — App Router, Route Handlers, Server Actions |
| Language | TypeScript 5 (strict) |
| UI | React 19 |
| 3D | [Three.js](https://threejs.org) r184, [React Three Fiber](https://r3f.docs.pmnd.rs) 9, [`@react-three/drei`](https://github.com/pmndrs/drei) 10, [`maath`](https://github.com/pmndrs/maath), [`postprocessing`](https://github.com/pmndrs/postprocessing) |
| Globe | Custom instanced-mesh GLSL shader globe (+ optional [COBE](https://cobe.vercel.app) alternative) |
| Animation | [Motion](https://motion.dev) 12 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first `@theme` config), `tailwind-merge` |
| Database | [Supabase](https://supabase.com) (Postgres + RLS) |
| Email | [Nodemailer](https://nodemailer.com) over SMTP, [EmailJS](https://www.emailjs.com) client fallback |
| Fonts | `next/font` — Funnel Display, self-hosted and preloaded |
| Hosting | [Vercel](https://vercel.com) |

## Quick start

**Requirements:** Node.js **20.9+** (Next 16's minimum) and npm.

```bash
git clone https://github.com/HasnainIrfan/myportfolio.git
cd myportfolio
npm install
cp .env.example .env      # then fill in the values you need
npm run dev
```

Open <http://localhost:3000>.

The marketing site renders with **no environment variables at all** — everything
in `.env` is only needed for the contact form and `/admin`. If you just want to
fork the front end, skip straight to [Make it your own](#make-it-your-own).

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |

## Environment variables

Copy [`.env.example`](.env.example) to `.env`. Everything is server-side except
the two `NEXT_PUBLIC_` values.

| Variable | Required for | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | contact form, `/admin` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | contact form | Browser-safe key. Matches nothing under RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | contact form, `/admin` | Server-side DB access. **Never expose to the browser.** |
| `ADMIN_EMAIL` | `/admin` | The one admin login address (matched case-insensitively) |
| `ADMIN_PASSWORD` | `/admin` | The one admin password (matched exactly) |
| `ADMIN_SESSION_SECRET` | `/admin` | Signs the session cookie. **Minimum 32 characters.** |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | email notifications | Outbound SMTP credentials |
| `CONTACT_RECIPIENT_EMAIL` | optional | Where enquiries are sent; falls back to a hardcoded address |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env*` is gitignored — no secret has ever been committed to this repository.
Set the same variables in your host's dashboard (Vercel → Settings →
Environment Variables) or `/admin` sign-in will fail in production.

## Project structure

```
app/
  layout.tsx              Root layout, fonts, SEO metadata, viewport theming
  page.tsx                Renders <HomePage />
  globals.css             Tailwind v4 @theme tokens + keyframes
  manifest.ts             Web App Manifest
  icon.tsx apple-icon.tsx Dynamically generated favicons
  admin/                  Protected inbox: page, layout, server actions
  api/
    contact/route.ts      Validate → persist to Supabase → send SMTP mail
    admin/login|logout    Session cookie issue / clear
components/
  portfolio/              Reusable pieces: astronaut, themed-globe (shader),
                          globe (COBE), particles, timeline, marquee,
                          orbiting-circles, project-card, project-details,
                          flip-words, loader, page-loader, alert,
                          parallax-background, copy-email-button, frameworks
  sections/               Page sections: navbar, hero, about, services,
                          projects, experiences, testimonial, contact, footer
constants/
  portfolio-constants.ts  ← ALL site copy and data lives here
  globe-constants.ts      COBE config and marker coordinates
helpers/particles-helpers.ts
lib/admin/                credentials · session · throttle · data
proxy.ts                  Next 16's renamed middleware — gates every /admin request
types/portfolio-types.ts  Shared types for every constant above
supabase/migrations/      0001_contact_submissions.sql
docs/                     Architecture, customization, deployment, admin
public/
  models/                 GLB 3D model (~3 MB)
  assets/                 Images, project shots, tech logos, social icons
```

## Make it your own

Fork it, then work through these four steps. Steps 1–3 need no component edits.

**1. Replace the content.** Open `constants/portfolio-constants.ts` — it holds
`HERO_NAME`, `HERO_ROLE`, `HERO_LOCATION`, `HERO_TAGLINE`, `STATS`,
`MY_PROJECTS`, `SERVICES`, `EXPERIENCES`, `REVIEWS`, `MY_SOCIALS`,
`FRAMEWORK_SKILLS`, `SKILL_CHIPS`, `FLIP_WORDS` and `CONTACT_EMAIL`. Every entry
is typed against `types/portfolio-types.ts`, so TypeScript tells you the moment
a field is missing.

**2. Swap the images.** Drop project screenshots into `public/assets/projects/`
and tech logos into `public/assets/logos/`, then point the `image` / `path`
fields at them.

**3. Recolor.** The palette is a Tailwind v4 `@theme` block at the top of
`app/globals.css` — change `--color-royal`, `--color-aqua`, `--color-lavender`
and friends and the whole site follows, including the gradients and the browser
chrome tint in `app/layout.tsx`.

**4. Update the SEO.** `app/layout.tsx` (`title`, `description`, `keywords`,
`authors`, `openGraph`) and `app/manifest.ts`.

**Changing the 3D model?** Put your `.glb` in `public/models/`, update the path
in `components/portfolio/astronaut.tsx`, and adjust `scale` / `position` in
`components/sections/hero.tsx`. Full walkthrough in
[`docs/customization.md`](docs/customization.md).

## Deployment

Deploys to Vercel with zero configuration — import the repo, add the environment
variables, ship. The 3D scenes are client-only (`dynamic(..., { ssr: false })`),
so any Node 20.9+ host works too. Step-by-step, including the one-time Supabase
migration: [`docs/deployment.md`](docs/deployment.md).

## Performance notes

- Hero and globe are dynamically imported with `ssr: false` — no WebGL runs during SSR, and the JS lands in separate chunks.
- The globe is one instanced draw call for 3,000 spikes; displacement, lighting and colour all happen on the GPU, so scroll stays on the main thread's good side.
- A page loader covers the first paint so the layout never jumps as the canvases mount.
- Fonts go through `next/font` (self-hosted, preloaded, zero layout shift).
- The GLB model is ~3 MB and the background plates are large PNGs — the biggest win available if you fork this is re-exporting the model with [Draco compression](https://github.com/google/draco) and converting `public/assets/*.png` to WebP/AVIF.
- `useMediaQuery` downscales the 3D scene on small screens instead of rendering the desktop scene and cropping it.

## Documentation

| Doc | Covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | How the render pipeline, stacking contexts, data flow and 3D layer fit together |
| [`docs/customization.md`](docs/customization.md) | Rebranding it as your own portfolio, end to end |
| [`docs/deployment.md`](docs/deployment.md) | Vercel + Supabase + SMTP setup, production checklist |
| [`docs/admin.md`](docs/admin.md) | The `/admin` inbox: auth model, migration, throttling |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Conventions, PR flow, what's in scope |

## Credits & asset licensing

The **code** is MIT licensed. The **content and assets are not** — please swap
them for your own before deploying:

- **Personal content** — name, biography, project write-ups, testimonials, experience and the résumé PDF belong to Hasnain Irfan. Replace them; don't republish them as your own.
- **3D model** — `public/models/tenhun_falling_spaceman_fanart.glb` is third-party fan art sourced from Sketchfab. **Check its original license and keep the required attribution** before you use it in your own deployment.
- **Project screenshots and client logos** belong to their respective owners.
- The shader globe is a retheme of a public React Three Fiber demo — see the header comment in `components/portfolio/themed-globe.tsx` for what changed and why.
- 3D helpers by the [pmndrs](https://github.com/pmndrs) ecosystem, animation by [Motion](https://motion.dev), marker globe by [COBE](https://cobe.vercel.app).

If this repo helped you build your own portfolio, a ⭐ is very welcome.

## License

[MIT](LICENSE) © Hasnain Irfan — code only. See
[Credits & asset licensing](#credits--asset-licensing) for the content and
assets.
