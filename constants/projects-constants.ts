/** The work section: the case studies themselves, and the showcase tuning. */

import { type Transition } from "motion/react";
import { type Project } from "@/types/portfolio-types";

export const MY_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Inverex Global",
    category: "Solar Energy · Pakistan",
    description:
      "Marketing & product site for Inverex — renewable, scalable solar energy for homes and businesses worldwide.",
    subDescription: [
      "Designed and shipped a fast, SEO-friendly marketing site with crisp motion polish.",
      "Built reusable section components for products, services and customer stories.",
      "Tuned image delivery, fonts and route transitions for premium feel on every device.",
      "Implemented responsive layouts and accessibility from the ground up.",
    ],
    href: "https://www.inverexglobal.com/",
    logo: "",
    image: "/assets/projects/elearning.jpg",
    accent: "from-aqua/40 to-royal/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Motion", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 2,
    title: "Getweys",
    category: "Digital Product Agency",
    description:
      "AI-first product agency shipping web platforms, mobile apps and growth systems — 1,000+ projects since 2020 across Austin, Karachi and Auckland.",
    subDescription: [
      "Built the agency site around a service catalogue spanning web, mobile, design and marketing.",
      "Structured case-study and sector sections covering fintech, healthcare, energy and government work.",
      "Implemented a clear discovery-to-launch process narrative with scroll-driven motion.",
      "Tuned performance, SEO and accessibility for B2B discovery at scale.",
    ],
    href: "https://getweys.com/",
    logo: "",
    image: "/assets/projects/wordpress-theme.jpg",
    accent: "from-royal/40 to-lavender/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "SEO", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 3,
    title: "PromptStore",
    category: "AI Marketplace",
    description:
      "Marketplace for buying and selling AI prompts tuned for ChatGPT, Claude, Midjourney, Flux and Cursor.",
    subDescription: [
      "Built a curated, category-driven prompt library with trending and community feeds.",
      "Implemented one-click checkout across Stripe, PayPal and crypto with instant delivery.",
      "Shipped a creator dashboard for listing, pricing and tracking prompt sales.",
      "Designed dense browse and preview surfaces that stay fast at catalogue scale.",
    ],
    href: "https://promptstore.io/",
    logo: "",
    image: "/assets/projects/game-engine.jpg",
    accent: "from-fuchsia/40 to-royal/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "Stripe", path: "/assets/logos/javascript.svg" },
      { id: 4, name: "Rest APIs", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 4,
    title: "ClipSave",
    category: "Media Tools",
    description:
      "Browser-based video downloader supporting nine platforms in SD, HD and FHD — no account, no caps, nothing stored.",
    subDescription: [
      "Built a single-input flow that resolves and returns downloads in seconds.",
      "Supported nine sources including YouTube, Instagram, TikTok and Vimeo across quality tiers.",
      "Shipped companion utilities — URL shortener, subtitle downloader and thumbnail extractor.",
      "Designed for zero-retention: no download history and no activity tracking.",
    ],
    href: "https://clipsaves.com/",
    logo: "",
    image: "/assets/projects/wordpress-theme.jpg",
    accent: "from-sand/40 to-coral/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "Node.js", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Rest APIs", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 5,
    title: "Fast Digital Technology",
    category: "Cyber Security Services",
    description:
      "Marketing & service site for a cyber security firm with motion-rich storytelling.",
    subDescription: [
      "Crafted high-impact landing experience with scroll-driven storytelling.",
      "Built a service catalogue and lead-capture flow.",
      "Optimised SEO and performance for B2B discovery.",
    ],
    href: "https://fastdigitaltechnology.com/",
    logo: "",
    image: "/assets/projects/auth-system.jpg",
    accent: "from-aqua/40 to-royal/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 3, name: "Motion", path: "/assets/logos/javascript.svg" },
      { id: 4, name: "SEO", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 6,
    title: "ATF Catalogue",
    category: "Interactive Flipbook · UAE",
    description:
      "Print product catalogue rebuilt as a page-turning digital flipbook for All Things Food, a premium F&B distributor in the UAE.",
    subDescription: [
      "Built a spread-based flipbook reader with page-turn transitions.",
      "Implemented progressive page preloading behind a branded loading sequence.",
      "Tuned spread rendering so paging stays smooth on mobile as well as desktop.",
      "Carried the client's brand type and colour system across every spread.",
    ],
    href: "https://online-flipbook.vercel.app/",
    logo: "",
    image: "/assets/projects/blazor-app.jpg",
    accent: "from-lavender/40 to-sand/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Motion", path: "/assets/logos/javascript.svg" },
    ],
  },
];

/** Spring for the card's pointer tilt — firm enough to track, soft enough to
 *  keep weight. */
export const TILT_SPRING: Transition = { stiffness: 200, damping: 18 };

/** Degrees of tilt at the extremes of the card. Typed as plain number tuples
 *  so `useTransform` reads them as a range rather than a pair of literals. */
export const TILT_RANGE: { x: [number, number]; y: [number, number] } = {
  x: [10, -10],
  y: [-14, 14],
};

/** Spring for the horizontal track and its progress bar. */
export const TRACK_SPRING: Transition = { stiffness: 60, damping: 20 };

/** How many panels either side of the active one keep their iframe mounted. */
export const PREVIEW_WINDOW = 1;
