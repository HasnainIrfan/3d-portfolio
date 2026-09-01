# Make it your own

Fork this repo and you can have a portfolio under your own name in about an
hour. Steps 1–4 need no component edits at all — every string on the page comes
out of one typed constants file.

Work top to bottom; each step is independent.

---

## 1. Content — the `constants/` folder

Every string on the site lives here, one file per domain. No component holds
copy. Everything is typed against `types/`, so if you miss a field, TypeScript
tells you before the page does.

| Export | File | Shows up in |
| --- | --- | --- |
| `HERO_NAME` `HERO_ROLE` `HERO_LOCATION` `HERO_TAGLINE` | `hero-constants.ts` | The headline block |
| `FLIP_WORDS` | `hero-constants.ts` | Animated word — keep them a similar length or the line jumps |
| `STATS` | `hero-constants.ts` | About strip. Hand-written, **not** derived — update it when your project count changes |
| `MY_PROJECTS` | `projects-constants.ts` | Projects grid + detail modal. See below |
| `SERVICES` | `services-constants.ts` | `title`, `description`, `icon`, `bullets[]` |
| `EXPERIENCES` | `experience-constants.ts` | `title`, `job`, `date`, `contents[]` |
| `REVIEWS` | `reviews-constants.ts` | The layout splits them evenly, so an even count looks best |
| `SKILL_CHIPS` | `skills-constants.ts` | Skill pills, free text |
| `MY_SOCIALS` `CONTACT_EMAIL` | `social-constants.ts` | Navbar, footer, mailto links |
| `NAV_ITEMS` | `navigation-constants.ts` | The header links and their anchors |

### A project entry

```ts
{
  id: 1,                                   // keep these sequential
  title: "Your Project",
  category: "Fintech · Remote",            // small label above the title
  description: "One-line summary for the card.",
  subDescription: [                        // bullets in the detail modal
    "What you built.",
    "A decision you made and why.",
    "A number, if you have one.",
  ],
  href: "https://the-live-site.com",
  logo: "",                                // optional
  image: "/assets/projects/your-shot.jpg",
  accent: "from-aqua/40 to-royal/10",       // Tailwind gradient, see step 3
  tags: [
    { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
  ],
}
```

Three to eight projects is the sweet spot for the grid.

---

## 2. Images — `public/assets/`

| Folder | Holds | Advice |
| --- | --- | --- |
| `projects/` | Project screenshots | Roughly 16:9. Export as **WebP** — the originals here are heavy JPG/PNG |
| `logos/` | Tech logos for the project tags | SVG |
| `socials/` | Social icons | SVG, monochrome so they inherit colour |
| *(root)* | `sky.jpg`, `mountain-1..3.png`, `planets.png` | The parallax background plates |

Replacing the parallax plates changes the whole mood of the hero. Keep the same
filenames and you won't have to touch `parallax-background.tsx`.

**Also replace:** `Hasnain.pdf` in the repo root (the résumé the site links to)
and, if you delete it, the link that points at it.

---

## 3. Colours — `app/globals.css`

Tailwind v4 is configured CSS-first. There is no `tailwind.config.js`; the
palette is an `@theme` block at the top of `app/globals.css`:

```css
@theme {
  --color-primary: #030412;   /* page background */
  --color-midnight: #06091f;
  --color-navy: #161a31;
  --color-indigo: #1f1e39;
  --color-storm: #282b4b;     /* card borders, dividers */
  --color-aqua: #33c2cc;      /* accent 1 */
  --color-mint: #57db96;
  --color-royal: #5c33cc;     /* accent 2 — the brand purple */
  --color-lavender: #7a57db;
  --color-fuchsia: #ca2f8c;
  --color-orange: #cc6033;
  --color-sand: #d6995c;
  --color-coral: #ea4884;
}
```

Every token becomes a utility — `--color-royal` gives you `bg-royal`,
`text-royal`, `from-royal/40`. Change a value here and the site follows,
including project card gradients (`accent`) and the shader globe, which reads
the same palette.

Two places outside the theme block also hold colour and should match:

- `app/layout.tsx` → `viewport.themeColor` (tints mobile browser chrome)
- `app/manifest.ts` → `background_color` / `theme_color`

---

## 4. SEO and identity

**`app/layout.tsx`** — `title`, `description`, `keywords[]`, `authors`, and the
`openGraph` block. Write the description for a human; it is what shows up under
your link in search results and on social cards.

**`app/manifest.ts`** — `name`, `short_name`, `description`.

**`app/icon.tsx` / `app/apple-icon.tsx`** — favicons generated at build time
from code (no image files). Edit the JSX inside.

Once deployed, add `metadataBase: new URL("https://yourdomain.com")` to the
`metadata` object so Open Graph image URLs resolve absolutely.

---

## 5. Swapping the 3D model

The astronaut is the site's signature, so this is the change that most makes it
yours.

1. Put your `.glb` in `public/models/`. Under 3 MB, ideally
   [Draco-compressed](https://github.com/google/draco).
2. Update the path in `components/portfolio/astronaut.tsx` (`useGLTF("/models/…")`).
3. The first embedded animation clip auto-plays. A model with no clips renders
   fine — it just sits still.
4. Adjust framing in `components/sections/hero.tsx`: the `scale` and `position`
   props, which have separate mobile values (below 853px).
5. Nudge the camera in the `<Canvas camera={{ position: [0, 1, 3] }}>` prop if
   your model is a different size.

Free, license-checked models: [Sketchfab](https://sketchfab.com/features/free-3d-models),
[Poly Pizza](https://poly.pizza), [Quaternius](https://quaternius.com).
**Check the licence and keep the attribution.**

---

## 6. Trimming what you don't need

**Drop the contact backend.** You do not have to delete anything — leave the
two Supabase variables unset and the site runs with the form pointing visitors
at your email address and `/admin` showing a setup panel. To remove the code
entirely: delete `app/api/contact/`, `app/admin/`, `lib/admin/`,
`lib/supabase/`, `components/admin/`, `supabase/` and `proxy.ts`, then point the
contact form at a `mailto:` link.

**Drop the shader globe** (the heaviest piece on the page): remove
`<ThemedGlobe />` from `components/portfolio/home-page.tsx`, then delete
`components/globe/`, `lib/globe/`, `constants/globe-constants.ts` and the
`use-globe-*` hooks. Nothing else depends on them.

**Add a section:** create it in `components/sections/`, add it to the list in
`home-page.tsx`, and — if the shader globe is still in play — add a matching
keyframe to `useGlobePath` in `themed-globe.tsx`, or the globe will slide past
your new section without stopping.

---

## Before you deploy

- [ ] No "Hasnain" left: `grep -ri "hasnain" app components constants public`
- [ ] Résumé PDF replaced or removed
- [ ] The 3D model is yours, or you kept its attribution
- [ ] Project screenshots are yours to publish
- [ ] `metadataBase` set to your domain
- [ ] Your own Supabase project, with your own admin in `admin_users`
- [ ] `npm run build` passes
- [ ] `LICENSE` updated to your name
