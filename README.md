<div align="center">

# Portfolio Website Template: Next.js, 3D Hero, Admin Panel & SEO

**A free, production-ready developer portfolio template.** 3D animated hero, a built-in admin
panel that captures your contact-form leads, and full SEO out of the box: sitemap, structured data
and Open Graph. Build your personal website with Next.js 16, React 19, TypeScript, Three.js and
Tailwind CSS v4.

[**Live Demo**](https://www.hasnainirfan.com) · [Documentation](docs/) · [Deploy](docs/deployment.md)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)

[![Developer portfolio website template with 3D animated hero, built with Next.js, Three.js and Tailwind CSS](docs/images/screenshot.jpg)](https://www.hasnainirfan.com)

</div>

## What you get

Most portfolio templates give you a page and stop. This one also tells you who got in touch, and
makes sure people can find you.

| | |
| --- | --- |
| **3D portfolio** | Animated GLTF hero, a GPU shader globe that travels with your scroll, a pinned horizontal case-study showcase, and scroll-driven reveals throughout |
| **Admin panel** | Enquiries save to *your* Supabase database and appear in a private inbox at `/admin` with search, pagination and delete. No form-service fee, no one else holding your leads |
| **SEO ready** | `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph, Twitter cards and JSON-LD structured data, all generated from your own content |

Every string, project and testimonial lives in `constants/`, one typed file per domain. Fork it,
edit that folder, and it is your portfolio, with no component changes needed.

## Features

**Design:** 3D animated hero · shader globe · pinned case-study showcase · sticky service cards ·
experience timeline · skills marquee · particle field · parallax background · responsive from 320px ·
respects `prefers-reduced-motion`

**Admin & leads:** contact form → your database · private inbox with search and pagination ·
Supabase Auth + an `admin_users` allowlist · an acknowledgement email to the visitor and the lead to
you · **zero secrets in the repo**

**SEO:** sitemap · robots · canonical · Open Graph + Twitter cards · JSON-LD (`Person`, `WebSite`,
`ProfilePage`, `ProfessionalService`) · Web App Manifest · generated favicons · self-hosted fonts ·
`/admin` excluded from indexing

**Code:** TypeScript strict · 0 lint errors · no file over 250 lines · organised by kind
(`constants/` `types/` `hooks/` `helpers/` `animations/`) · runs with an empty `.env`

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Three.js + React Three Fiber ·
Motion · Supabase (Postgres, Auth, RLS, Edge Functions) · Vercel

## Quick start

```bash
git clone https://github.com/HasnainIrfan/myportfolio.git
cd myportfolio
npm install
npm run dev
```

Open <http://localhost:3000>. Requires Node 20.9+. **No environment variables needed.** The site
builds, deploys and runs with an empty `.env`.

## Environment variables

Four, all optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your domain. Drives the sitemap, canonical and Open Graph URLs. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console token. Renders the verification meta tag. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

There are **no server-only secrets**: no admin password, no session key, no service-role key, no
SMTP credentials. Row-level security does the enforcing, and SMTP lives in Supabase.

## Make it yours

1. **Content:** edit `constants/` (hero, projects, services, experience, reviews, skills, socials)
2. **Images:** `public/assets/`, and replace `public/og.jpg` with your own 1200×630 preview
3. **Colours:** the `@theme` block at the top of `app/globals.css`
4. **SEO:** `constants/seo-constants.ts`, then set `NEXT_PUBLIC_SITE_URL`
5. **3D model:** drop a `.glb` in `public/models/` and update `components/portfolio/astronaut.tsx`

Full walkthrough: [`docs/customization.md`](docs/customization.md)

## Deployment

Import the repo on Vercel and ship. There is nothing to configure. Add the Supabase values when you want the
contact form and admin panel. Setup for the database, admin account and lead emails:
[`docs/deployment.md`](docs/deployment.md).

## Documentation

| | |
| --- | --- |
| [`docs/customization.md`](docs/customization.md) | Making it your own, end to end |
| [`docs/deployment.md`](docs/deployment.md) | Vercel, Supabase, Edge Function, checklist |
| [`docs/admin.md`](docs/admin.md) | Admin panel: auth model, SQL, lead emails |
| [`docs/architecture.md`](docs/architecture.md) | Project structure, the 3D layer, auth, database |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Conventions and PR flow |

## Credits & licensing

Code is [MIT](LICENSE). The content and assets are **not**. Replace them before deploying:

- Personal content (name, biography, project write-ups, testimonials, résumé) belongs to Hasnain Irfan
- `public/models/*.glb` is third-party fan art from Sketchfab, so **check its licence and keep the attribution**
- Project screenshots and client logos belong to their owners

3D helpers by [pmndrs](https://github.com/pmndrs), animation by [Motion](https://motion.dev).

If this helped you build your portfolio website, a ⭐ is very welcome.
