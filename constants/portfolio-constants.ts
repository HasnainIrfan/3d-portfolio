import {
  type Experience,
  type Project,
  type Review,
  type Service,
  type SocialLink,
  type Stat,
} from "@/types/portfolio-types";

export const HERO_NAME = "Hasnain Irfan";
export const HERO_ROLE = "Senior Software Engineer";
export const HERO_LOCATION = "Karachi, Pakistan";
export const HERO_TAGLINE =
  "I architect scalable web & mobile products with React, Next.js and Node.js — turning complex ideas into shipped, revenue-ready software.";

export const STATS: Stat[] = [
  { value: "5+", label: "Years building products" },
  { value: "20+", label: "Shipped projects" },
  { value: "1k+", label: "End users served" },
  { value: "40%", label: "Avg. productivity lift" },
];

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

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Web Applications",
    description:
      "Production-grade Next.js & React apps — fast, accessible, SEO-friendly, and built to scale.",
    icon: "/assets/logos/react.svg",
    bullets: [
      "Landing pages & marketing sites",
      "Dashboards & SaaS platforms",
      "Server rendering & edge runtime",
    ],
  },
  {
    id: 2,
    title: "Mobile Apps",
    description:
      "Cross-platform mobile apps with React Native + Expo, polished UI and native-grade performance.",
    icon: "/assets/logos/react.svg",
    bullets: [
      "iOS & Android from one codebase",
      "Push notifications & deep links",
      "Offline-first patterns",
    ],
  },
  {
    id: 3,
    title: "Admin Panels & CMS",
    description:
      "Powerful internal tools and admin portals with reusable components and role-based access.",
    icon: "/assets/logos/tailwindcss.svg",
    bullets: [
      "Bespoke admin dashboards",
      "Data tables, filters & exports",
      "Auth, roles & permissions",
    ],
  },
  {
    id: 4,
    title: "APIs & Backends",
    description:
      "Robust Node.js / Express APIs with SQL or MongoDB, cron jobs, and clean integration patterns.",
    icon: "/assets/logos/javascript.svg",
    bullets: [
      "REST API design & docs",
      "Database modelling (SQL & NoSQL)",
      "Background jobs & webhooks",
    ],
  },
];

export const MY_SOCIALS: SocialLink[] = [
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/hasnainirfan/",
    icon: "/assets/socials/linkedIn.svg",
  },
  {
    name: "GitHub",
    href: "https://github.com/hasnainirfan",
    icon: "/assets/socials/github.svg",
  },
];

export const EXPERIENCES: Experience[] = [
  {
    title: "Senior Software Engineer",
    job: "Getweys · Karachi",
    date: "2023 — Present",
    contents: [
      "Designing and delivering scalable web applications using React, Next.js and Node.js.",
      "Leading cross-functional collaboration and shipping projects ahead of deadlines.",
      "Contributing to architecture decisions that keep codebases scalable and maintainable.",
      "Mentoring and upskilling team members, lifting overall productivity and code quality.",
    ],
  },
  {
    title: "Junior Team Lead",
    job: "Digital Graphiks · Karachi",
    date: "Feb 2023 — Jun 2023",
    contents: [
      "Led a team of developers to deliver complex projects on time with React, Next.js and Node.js.",
      "Streamlined workflows and code review standards across teams.",
      "Debugged and resolved production issues quickly to keep products running smoothly.",
      "Mentored junior developers and grew the team's overall skillset.",
    ],
  },
  {
    title: "Front-End Developer",
    job: "Lucid Web Solution · Karachi",
    date: "Sep 2022 — Feb 2023",
    contents: [
      "Built responsive, accessible UIs that improved user satisfaction.",
      "Developed dynamic web apps using React, Next.js, JavaScript, HTML and CSS.",
      "Integrated REST APIs and dynamic data visualisation to enhance interactivity.",
    ],
  },
];

export const REVIEWS: Review[] = [
  {
    name: "Daniel Cole",
    role: "CTO · Arootah",
    body: "He doesn't just close tickets — he improves the architecture as he goes. Our investment dashboards are faster and far easier to maintain since he joined.",
    accent: "from-royal to-lavender",
  },
  {
    name: "Sara Whitman",
    role: "Product Lead · Getweys",
    body: "One of the most reliable engineers I've worked with. Sharp judgement, great communication, and the UI quality is consistently a level above what we asked for.",
    accent: "from-mint to-aqua",
  },
  {
    name: "Omar Siddiqui",
    role: "Engineering Manager",
    body: "Strong engineering instincts and a natural mentor. He lifted the whole team's standards on code review and shipped features that actually moved our metrics.",
    accent: "from-lavender to-coral",
  },
  {
    name: "Priya Nair",
    role: "Tech Lead",
    body: "We migrated a legacy stack to Next.js + Node with Hasnain leading the effort — fewer bugs, faster pages, and a much happier engineering team.",
    accent: "from-fuchsia to-royal",
  },
  {
    name: "Aisha Raza",
    role: "Product Manager",
    body: "Communicative, dependable and thoughtful about edge cases before they become problems. Planning a release around him is genuinely low-stress.",
    accent: "from-sand to-coral",
  },
  {
    name: "Liam Foster",
    role: "Founder",
    body: "Calm under pressure and very deliberate about scale. He shipped our launch ahead of schedule and I'd hire him again in a heartbeat.",
    accent: "from-aqua to-mint",
  },
];

export const FLIP_WORDS = ["Scalable", "Modern", "Reliable"];

export const FRAMEWORK_SKILLS = [
  "react",
  "javascript",
  "tailwindcss",
  "git",
  "github",
  "html5",
  "css3",
  "threejs",
  "visualstudiocode",
] as const;

export const SKILL_CHIPS = [
  "JavaScript",
  "TypeScript",
  "React.js",
  "Next.js",
  "Redux",
  "Node.js",
  "Express.js",
  "MongoDB",
  "SQL",
  "React Native",
  "Expo",
  "REST APIs",
  "Tailwind",
  "Material-UI",
  "Three.js",
  "WebGL",
  "Git",
];

export const CONTACT_EMAIL = "hasnainirfandeveloper@gmail.com";
