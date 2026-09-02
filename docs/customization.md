# Make it your own

Fork this repo and you can have a portfolio under your own name in about an
hour. Steps 1 to 4 need no component edits at all, because every string on the page comes
out of one typed constants file.

Work top to bottom; each step is independent.

---

## 1. Content: the `constants/` folder

Every string on the site lives here, one file per domain. No component holds
copy. Everything is typed against `types/`, so if you miss a field, TypeScript
tells you before the page does.

| Export | File | Shows up in |
| --- | --- | --- |
| `HERO_NAME` `HERO_ROLE` `HERO_LOCATION` `HERO_TAGLINE` | `hero-constants.ts` | The headline block |
| `FLIP_WORDS` | `hero-constants.ts` | Animated word. Keep them a similar length or the line jumps |
| `STATS` | `hero-constants.ts` | About strip. Hand-written, **not** derived. Update it when your project count changes |
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
  image: "/projects/your-shot.webp",       // screenshot, or "" for a live embed
  accent: "from-aqua/40 to-royal/10",       // Tailwind gradient, see step 3
  tags: [
    { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
  ],
}
```

Three to eight projects is the sweet spot for the grid.

`image` decides how the showcase renders the panel. Give it a screenshot in
`public/projects/` and that image is shown. Leave it `""` and the panel embeds
`href` in an iframe instead, which is live but pulls the whole external site
into your page. Prefer a screenshot: export it as **WebP** around 1800px wide,
which lands near 80&nbsp;KB against several megabytes for the live embed.

---

## 2. Images: `public/assets/`

| Folder | Holds | Advice |
| --- | --- | --- |
| `projects/` | Project screenshots | Roughly 16:9. Export as **WebP**. The originals here are heavy JPG/PNG |
| `logos/` | Tech logos for the project tags | SVG |
| `socials/` | Social icons | SVG, monochrome so they inherit colour |
| *(root)* | `sky.jpg`, `mountain-1..3.png`, `planets.png` | The parallax background plates |

Replacing the parallax plates changes the whole mood of the hero. Keep the same
filenames and you won't have to touch `parallax-background.tsx`.

**Also replace:** `Hasnain.pdf` in the repo root (the résumé the site links to)
and, if you delete it, the link that points at it.

---

## 3. Colours: `app/globals.css`

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
  --color-royal: #5c33cc;     /* accent 2, the brand purple */
  --color-lavender: #7a57db;
  --color-fuchsia: #ca2f8c;
  --color-orange: #cc6033;
  --color-sand: #d6995c;
  --color-coral: #ea4884;
}
```

Every token becomes a utility: `--color-royal` gives you `bg-royal`,
`text-royal`, `from-royal/40`. Change a value here and the site follows,
including project card gradients (`accent`) and the shader globe, which reads
the same palette.

Two places outside the theme block also hold colour and should match:

- `app/layout.tsx` → `viewport.themeColor` (tints mobile browser chrome)
- `app/manifest.ts` → `background_color` / `theme_color`

---

## 4. SEO and identity

**`constants/seo-constants.ts`** is the single source. Site-wide defaults:
`SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_TAGLINE`, `SITE_KEYWORDS`, `OG_IMAGE`.
Per-route copy: `HOME_TITLE` and `HOME_DESCRIPTION` for the portfolio,
`ADMIN_TITLE` / `ADMIN_LOGIN_TITLE` and their descriptions for the private
dashboard. `SITE_SECTIONS` lists the on-page anchors and feeds the JSON-LD.

Write the description for a human and keep it under about 160 characters. It is
what shows under your link in search results and on social cards. Titles read
best under about 60 characters.

Everything downstream reads from it:

- `app/layout.tsx`: site-wide defaults, title template, Open Graph, Twitter card
- `app/page.tsx`: the home title, meta description, canonical and profile card
- `app/admin/layout.tsx` and the admin pages: titles plus `noindex, nofollow`
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- `components/seo/json-ld.tsx`: Person, WebSite, ProfilePage, section ItemList
  and ProfessionalService structured data

**`public/og.jpg`:** your social preview, 1200×630. This is what appears when
someone shares your link.

**`app/icon.tsx` / `app/apple-icon.tsx`:** favicons generated at build time
from code (no image files). Edit the JSX inside.

**Set `NEXT_PUBLIC_SITE_URL`** to your domain once deployed. That one variable
drives the canonical URL, the sitemap, robots.txt and every Open Graph image
URL.

**Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`** to the token Google Search
Console gives you and the `google-site-verification` meta tag is rendered on
every page. Leave it unset and no tag is emitted.

---

## 5. Swapping the 3D model

The astronaut is the site's signature, so this is the change that most makes it
yours.

1. Put your `.glb` in `public/models/`. Keep it under 1 MB. Run it through

   ```bash
   npx @gltf-transform/cli optimize in.glb out.glb \
     --texture-compress webp --texture-size 1024 \
     --compress meshopt --flatten false --join false --simplify false
   ```

   which took the bundled astronaut from 2.99 MB to 363 KB. The three `false`
   flags matter. `astronaut.tsx` rebuilds the node hierarchy by hand and looks
   meshes up by name, so it never sees the transforms on the glTF nodes:
   `--flatten` pushes the root scale down onto the mesh and bone nodes and the
   model renders about five times too small, and `--join` merges the meshes and
   renames them. Meshopt needs no extra decoder, drei bundles it.
2. Update the path in `components/portfolio/astronaut.tsx` (`useGLTF("/models/…")`).
3. The first embedded animation clip auto-plays. A model with no clips renders
   fine, it just sits still.
4. Adjust framing in `components/sections/hero-scene.tsx`: the `scale` and
   `position` props, which have separate mobile values (below 853px).
5. Nudge the camera in the `<Canvas camera={{ position: [0, 1, 3] }}>` prop if
   your model is a different size.

Free, license-checked models: [Sketchfab](https://sketchfab.com/features/free-3d-models),
[Poly Pizza](https://poly.pizza), [Quaternius](https://quaternius.com).
**Check the licence and keep the attribution.**

Neither canvas mounts on phones. See "Performance budget" in
[`architecture.md`](architecture.md) for the rules and how to change them.

### Hero artwork

The parallax layers in `public/assets/` are WebP and are rendered through
`next/image`, so Next serves AVIF or WebP at the device width. If you replace
them, convert first (`cwebp -q 76 in.png -o out.webp`) and keep the same
1820x1020 aspect. Phones load only `sky.webp` plus a gradient; the three
mountain layers and `planets.webp` are desktop only.

---

## 6. Trimming what you don't need

**Drop the contact backend.** You do not have to delete anything. Leave the
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
`home-page.tsx`, and (if the shader globe is still in play) add a matching
keyframe to `useGlobePath` in `themed-globe.tsx`, or the globe will slide past
your new section without stopping.

---

## Before you deploy

- [ ] No "Hasnain" left: `grep -ri "hasnain" app components constants public`
- [ ] Résumé PDF replaced or removed
- [ ] The 3D model is yours, or you kept its attribution
- [ ] Project screenshots are yours to publish
- [ ] `NEXT_PUBLIC_SITE_URL` set to your domain
- [ ] `public/og.jpg` replaced with your own preview
- [ ] `/sitemap.xml` and `/robots.txt` resolve on the live site
- [ ] Your own Supabase project, with your own admin in `admin_users`
- [ ] `npm run build` passes
- [ ] `LICENSE` updated to your name
