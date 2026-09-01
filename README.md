<div align="center">

# Developer Portfolio Website — Next.js 16, 3D Hero, Admin Panel & Full SEO

**A complete, production-ready portfolio website template for developers, designers and freelancers.**
Not just a landing page: it ships with an interactive 3D hero, a working contact form, a private
admin panel to read your leads, and the SEO groundwork most portfolio templates skip.

Built with Next.js 16 (App Router), React 19, TypeScript, Three.js and Tailwind CSS v4.

[**Live Demo →**](https://hasnaindeveloper.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_+_RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)

<br />

[![Developer portfolio website template built with Next.js, Three.js and Tailwind CSS — 3D animated hero section](docs/images/screenshot.jpg)](https://hasnaindeveloper.vercel.app)

<sub><i>The hero section — a GLTF astronaut over parallax alien terrain. A GPU shader globe takes over as you scroll.</i></sub>

</div>

---

## Table of contents

- [Why this template](#why-this-template)
- [Features](#features)
- [SEO, in detail](#seo-in-detail)
- [Where your leads go](#where-your-leads-go)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Make it your own](#make-it-your-own)
- [Deployment](#deployment)
- [Performance](#performance)
- [FAQ](#faq)
- [Documentation](#documentation)
- [Credits & asset licensing](#credits--asset-licensing)
- [License](#license)

---

## Why this template

Most portfolio templates give you a good-looking page and stop there. You still have no idea
who visited, enquiries land in a third-party form service, and the site is invisible to search.
This one closes all three gaps.

| | What you get | Why it matters |
| --- | --- | --- |
| **🎨 A portfolio people remember** | A 3D animated hero, a GPU shader globe that travels with your scroll, scroll-driven section reveals and a pinned horizontal case-study showcase | A portfolio's first job is to not look like everyone else's |
| **📥 A real admin panel** | Enquiries save to **your** database and appear in a private inbox at `/admin` — search, paginate, delete | No monthly form-service fee, no one else holding your leads |
| **🔍 SEO done properly** | Sitemap, robots, canonical, Open Graph, Twitter cards and JSON-LD structured data — all generated from your own content | A portfolio nobody can find is a business card in a drawer |

It is also **genuinely reusable**. Every string, project, service and testimonial lives in
`constants/` — one file per domain, fully typed. Fork it, edit that folder, and you have your own
portfolio website without touching a single component.

## Features

### 3D & visual
- **Animated 3D hero** — a GLTF model with a mouse-reactive camera rig, damped easing and a spring entrance.
- **GPU shader globe** — 3,000 capsules instanced onto a Fibonacci sphere in **one draw call**, with four orbiting orbs carving travelling craters via inverse-square displacement computed entirely in the vertex shader. Analytic fresnel glass, an aqua rim light and a bloom pass.
- **A globe that flies down the page** — one keyframe per section, joined by a Catmull-Rom spline and chased by critically damped springs, so it travels with your scroll instead of cutting between positions.
- **Mouse-magnetized particle field** behind the contact section.
- **Parallax background layers** that respond to pointer movement.
- Scenes rescale on mobile, and every animation respects `prefers-reduced-motion`.

### Sections & UI
- Hero · About · Services · Work · Experience · Testimonials · Contact · Footer — all driven by data.
- **Pinned horizontal case-study showcase** on desktop, stacking vertically on mobile, with a live iframe preview of each project that tilts toward the cursor.
- Sticky stacked service cards, an animated experience timeline, a counter-rotating skills marquee, a flip-word headline and toast alerts.
- Responsive from 320px up, keyboard-navigable, semantic headings throughout.

### Admin panel & lead capture
- **Contact form** → validated Route Handler → your Supabase table.
- **Private inbox at `/admin`** — total and last-7-day counters, newest-first list at 25/page, full-text search across name, email and message, and delete.
- **Supabase Auth** for sign-in, plus an `admin_users` allowlist for authorisation, because "signed in" and "allowed to read strangers' contact details" are not the same question.
- **Two emails per enquiry** — an acknowledgement to the visitor, and the lead to you with `Reply-To` set to them.
- **Zero secrets in the repo.** No admin password, no session key, no service-role key, no SMTP credentials.

### Developer experience
- **TypeScript strict**, 0 lint errors, no file over ~250 lines.
- Organised by kind: `constants/` `types/` `hooks/` `helpers/` `animations/` `components/`.
- **Degrades instead of erroring** — with an empty `.env` the site builds and runs; `/admin` shows a setup panel and the contact form points visitors at your email.
- One SQL file to set up the whole database, including your admin account.

## SEO, in detail

Everything below is generated from your own content in `constants/` — change your name once and it
propagates through the metadata, the structured data and the manifest.

| | Where |
| --- | --- |
| **Sitemap** at `/sitemap.xml` | `app/sitemap.ts` |
| **`robots.txt`** with `/admin` and `/api` excluded | `app/robots.ts` |
| **Canonical URL** | `alternates.canonical` |
| **Open Graph** — title, description, locale, site name, and a 1200×630 image | `app/layout.tsx` |
| **Twitter** `summary_large_image` card | `app/layout.tsx` |
| **JSON-LD structured data** — `Person`, `WebSite`, `ProfilePage` and `ProfessionalService` with a service catalogue, in one `@graph` | `components/seo/json-ld.tsx` |
| **Googlebot directives** — `max-image-preview:large`, unlimited snippet length | `robots.googleBot` |
| **Web App Manifest** + generated favicons and Apple touch icon | `app/manifest.ts`, `app/icon.tsx` |
| **`metadataBase`** so every relative OG URL resolves absolutely | `app/layout.tsx` |
| **Admin `noindex, nofollow`** — it lists real people's contact details | `app/admin/layout.tsx` |
| **Self-hosted fonts** via `next/font` — no layout shift, no third-party request | `app/layout.tsx` |

Set `NEXT_PUBLIC_SITE_URL` to your domain and every one of these updates itself.

## Where your leads go

A portfolio's job is to turn a visitor into a conversation. This one keeps that whole path in your hands.

```
Visitor fills in the contact form
        │
        ▼
POST /api/contact           validates every field, then writes one row
        │                   (anon key, INSERT-only under RLS)
        ▼
contact_submissions         the lead is now safe
        │
        ├──▶ Database Webhook ─▶ notify-contact Edge Function
        │                          ├─ ✉ acknowledgement to the sender
        │                          └─ ✉ the lead to you (Reply-To: sender)
        │                             SMTP credentials live in Supabase
        ▼
Read it at  /admin          your private inbox — search, page, delete
```

**Two emails go out, and the sender's goes first.** Someone who has just written to a stranger is the
one waiting on a reply; you are not. **The row is written before either**, so a bounced SMTP password
costs you a notification, never the lead itself.

**Nothing in this repo can send email.** The SMTP credentials are Supabase secrets. Clone the repo
and you have nothing to leak.

### Security model, briefly

- Gated three times: `proxy.ts` before a page renders, `getAdminState()` inside the page and every Server Action, and the RLS policy in the database.
- Sessions, password hashing, refresh-token rotation and sign-in rate limiting are Supabase Auth's job, not this codebase's.
- **No service-role key exists in this project.** Every query runs as whoever made the request, so row-level security is the actual enforcement.
- `anon` may INSERT into `contact_submissions` and nothing else — a visitor cannot read back even the row they just wrote.
- `admin_users` has no insert, update or delete policy at all. Nothing the app can be tricked into doing will create an admin.

Full detail in [`docs/admin.md`](docs/admin.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) — App Router, Route Handlers, Server Actions |
| Language | TypeScript 5 (strict) |
| UI | React 19 |
| 3D | [Three.js](https://threejs.org) r184, [React Three Fiber](https://r3f.docs.pmnd.rs) 9, [`drei`](https://github.com/pmndrs/drei), [`maath`](https://github.com/pmndrs/maath), [`postprocessing`](https://github.com/pmndrs/postprocessing) |
| Animation | [Motion](https://motion.dev) 12 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first `@theme`, no config file |
| Database | [Supabase](https://supabase.com) — Postgres with row-level security |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) via `@supabase/ssr` |
| Email | Supabase Edge Function (Deno) over SMTP |
| Fonts | `next/font` — self-hosted, preloaded |
| Hosting | [Vercel](https://vercel.com) |

## Quick start

**Requirements:** Node.js **20.9+** and npm.

```bash
git clone https://github.com/HasnainIrfan/myportfolio.git
cd myportfolio
npm install
npm run dev
```

Open <http://localhost:3000>. **No environment variables needed** — the site runs, builds and deploys
with an empty `.env`. Add Supabase later when you want the contact form and admin panel.

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables

Three, all optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your domain. Drives the sitemap, canonical and OG URLs. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

That is the entire list — **this project has no server-only secrets.** The anon key is not a secret;
it identifies the project, and [row-level security](supabase/migrations/0001_init.sql) decides what
it can reach.

SMTP credentials are Supabase secrets, not deployment variables:

```bash
supabase secrets set SMTP_HOST=... SMTP_USER=... SMTP_PASS=... \
                     CONTACT_RECIPIENT_EMAIL=... OWNER_NAME="Your Name" \
                     SITE_URL=https://yoursite.com \
                     NOTIFY_WEBHOOK_SECRET="$(openssl rand -hex 32)"
```

## Project structure

Organised by *kind*, so anything you want to change has one obvious home.

```
app/
  layout.tsx              Root layout, fonts, full SEO metadata, JSON-LD
  sitemap.ts robots.ts    Generated from your own content
  manifest.ts icon.tsx    PWA manifest and generated favicons
  admin/                  Protected inbox: page, actions, login
  api/contact/route.ts    Validate → persist one row to Supabase

components/
  sections/               Thin page sections — composition only
  globe/ projects/ contact/ services/ about/ navbar/ admin/
  seo/                    JSON-LD structured data
  ui/                     Cross-section primitives
  portfolio/              Shared pieces: astronaut, particles, timeline, …

constants/                All copy, data and tuning — no strings in components
types/                    Every shared interface, one file per domain
hooks/                    Reusable behaviour (scroll, pointer, in-view, forms)
helpers/                  Pure functions (math, formatting, geometry, scroll)
animations/               Motion variants and springs
lib/                      supabase/ · admin/ · globe/ (GLSL sources)

proxy.ts                  Next 16's renamed middleware — gates /admin
supabase/
  migrations/0001_init.sql  The whole schema in one file
  functions/                notify-contact Edge Function
public/
  models/ assets/ og.jpg
```

## Make it your own

Fork it, then work through these. Steps 1–4 need no component edits.

**1. Content.** Everything lives in `constants/`, one file per domain — `hero-constants.ts`,
`projects-constants.ts`, `services-constants.ts`, `experience-constants.ts`,
`reviews-constants.ts`, `skills-constants.ts`, `social-constants.ts`. No component holds a string,
and everything is typed against `types/`.

**2. Images.** Project shots into `public/assets/projects/`, tech logos into `public/assets/logos/`,
and replace `public/og.jpg` (1200×630) with your own social preview.

**3. Colours.** The palette is a Tailwind v4 `@theme` block at the top of `app/globals.css`. Change
`--color-royal`, `--color-aqua`, `--color-coral` and the whole site follows, globe included.

**4. SEO.** `constants/seo-constants.ts` — title, description, keywords, social profiles. Set
`NEXT_PUBLIC_SITE_URL` to your domain.

**5. The 3D model.** Drop your `.glb` in `public/models/`, update the path in
`components/portfolio/astronaut.tsx`, and adjust `scale`/`position` in `components/sections/hero.tsx`.

Full walkthrough in [`docs/customization.md`](docs/customization.md).

## Deployment

Deploys to Vercel with zero configuration — import the repo and ship; there are no required
environment variables. Add the Supabase values when you want the contact form and inbox. Any
Node 20.9+ host works too. Step-by-step, including the SQL and the Edge Function:
[`docs/deployment.md`](docs/deployment.md).

## Performance

- Hero and globe are dynamically imported with `ssr: false` — no WebGL during SSR, and their JS lands in separate chunks.
- The globe is one instanced draw call for 3,000 spikes; displacement, lighting and colour all happen on the GPU.
- The composer skips rendering entirely while the globe is invisible, keeping a full-screen bloom pass off the GPU for the whole first screen.
- Project preview iframes mount only for the panels near the viewport.
- Fonts self-hosted and preloaded through `next/font` — zero layout shift.
- Biggest win available if you fork this: re-export the GLB with [Draco compression](https://github.com/google/draco) and convert the background plates to WebP.

## FAQ

**Do I need Supabase to use this?**
No. With an empty `.env` the site builds, deploys and runs. You only need it for the contact form and admin panel.

**Can I use this for a non-developer portfolio?**
Yes — designer, photographer, writer, agency. The sections are generic (about, services, work, testimonials, contact) and all the copy is data.

**Is the 3D required?**
No. Remove `<ThemedGlobe />` from `components/portfolio/home-page.tsx` and delete `components/globe/`. The rest of the site is unaffected.

**Will it rank?**
The technical groundwork is done — sitemap, robots, canonical, structured data, fast self-hosted fonts, semantic markup. Ranking still depends on your content, your domain and your backlinks.

**Is it accessible?**
Responsive from 320px, keyboard-navigable, semantic headings, `aria-label`s on icon buttons, decorative layers marked `aria-hidden`, and `prefers-reduced-motion` respected in the 3D scenes.

## Documentation

| Doc | Covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Render pipeline, stacking contexts, the 3D layer, auth, database |
| [`docs/customization.md`](docs/customization.md) | Rebranding it as your own portfolio, end to end |
| [`docs/deployment.md`](docs/deployment.md) | Vercel + Supabase setup, Edge Function, production checklist |
| [`docs/admin.md`](docs/admin.md) | The admin panel: auth model, SQL, lead emails |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Conventions, PR flow, what's in scope |

## Credits & asset licensing

The **code** is MIT licensed. The **content and assets are not** — swap them before deploying:

- **Personal content** — name, biography, project write-ups, testimonials, experience and the résumé PDF belong to Hasnain Irfan.
- **3D model** — `public/models/tenhun_falling_spaceman_fanart.glb` is third-party fan art from Sketchfab. **Check its licence and keep the required attribution.**
- **Project screenshots and client logos** belong to their respective owners.
- The shader globe is a retheme of a public React Three Fiber demo.
- 3D helpers by [pmndrs](https://github.com/pmndrs), animation by [Motion](https://motion.dev).

If this helped you build your own portfolio website, a ⭐ is very welcome.

## License

[MIT](LICENSE) © Hasnain Irfan — code only. See
[Credits & asset licensing](#credits--asset-licensing) for content and assets.
