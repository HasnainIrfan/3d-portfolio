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
    id: 0,
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
    id: 1,
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
    id: 2,
    title: "Fit From Anywhere",
    category: "Fitness SaaS · USA",
    description:
      "Community fitness platform for Stanford Faculty & Staff Housing — 1:1 coaching, goal-based programs, a video library and trainer messaging.",
    subDescription: [
      "Designed and built the Admin Portal on Next.js with 20+ reusable components (radio, checkbox, date/time pickers).",
      "Implemented user authentication, daily workout plans, and progress tracking across the platform.",
      "Built automated cron jobs sending push notifications for trainer appointments and reminders.",
      "Optimised SQL queries and scalable schemas; collaborated in an agile team of 8 to ship on time.",
    ],
    href: "https://ffa-landing.vercel.app/",
    logo: "",
    image: "/assets/projects/accessories.jpg",
    accent: "from-aqua/40 to-mint/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "React Native", path: "/assets/logos/react.svg" },
      { id: 3, name: "Node.js", path: "/assets/logos/javascript.svg" },
      { id: 4, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
    ],
  },
  {
    id: 3,
    title: "PipPipYalah",
    category: "Carpooling & Mobility · Morocco",
    description:
      "Carpooling and private-transfer platform matching riders with verified drivers across cities and airports.",
    subDescription: [
      "Built ride search and matching flows with real-time pricing.",
      "Implemented booking, payments and driver verification journeys.",
      "Shipped a bilingual, mobile-first UI for a high-traffic consumer audience.",
    ],
    href: "https://pippipyalah.com/",
    logo: "",
    image: "/assets/projects/blazor-app.jpg",
    accent: "from-mint/40 to-aqua/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "Node.js", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "MongoDB", path: "/assets/logos/git.svg" },
      { id: 4, name: "Rest APIs", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 4,
    title: "Brickk",
    category: "Fintech · Credit Building · UK",
    description:
      "UK rent-reporting platform that turns monthly rent into credit history with Experian, Equifax and TransUnion — plus a rewards marketplace.",
    subDescription: [
      "Built the renter dashboard surfacing credit status, reporting activity and rewards.",
      "Integrated open-banking connectivity for automatic rent-payment detection.",
      "Implemented a marketplace of 1,000+ brand offers with a points-to-rent redemption flow.",
      "Handled subscription billing and per-user control over what gets reported.",
    ],
    href: "https://brickk.co.uk/",
    logo: "",
    image: "/assets/projects/auth-system.jpg",
    accent: "from-royal/40 to-aqua/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "Stripe", path: "/assets/logos/javascript.svg" },
      { id: 4, name: "Open Banking", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 5,
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
    id: 6,
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
    id: 7,
    title: "Axis",
    category: "AI Design Workspace",
    description:
      "AI design workspace built around a node graph for iterating on UI generations and branching between versions.",
    subDescription: [
      "Built an interactive node-graph canvas for chaining and comparing generations.",
      "Implemented branching history so any iteration can be forked and revisited.",
      "Optimised canvas render performance for large graphs without jank.",
    ],
    href: "https://onaxis.design/",
    logo: "",
    image: "/assets/projects/game-engine.jpg",
    accent: "from-aqua/40 to-mint/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Rest APIs", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 8,
    title: "TG Finder",
    category: "Web3 Discovery Tool",
    description:
      "Discovery & analytics tool for Telegram communities — surfaces channels, signals and trends in a slick UI.",
    subDescription: [
      "Built fast search and filtering across Telegram-source data.",
      "Designed dense, scannable dashboards with smooth motion.",
      "Engineered a responsive layout that holds up on mobile and desktop.",
    ],
    href: "https://www.tgfinder.xyz/",
    logo: "",
    image: "/assets/projects/elearning.jpg",
    accent: "from-lavender/40 to-fuchsia/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Web3", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 9,
    title: "VacayCraze",
    category: "Travel & Vacation Planning",
    description:
      "Travel & vacation planning app that lets users design itineraries and book end-to-end.",
    subDescription: [
      "Built itinerary builder with reusable trip-card components.",
      "Implemented booking flow with stripe-style step UI and validation.",
      "Optimised images, hero loads and route transitions for travel-grade polish.",
    ],
    href: "https://vacaycraze.com/",
    logo: "",
    image: "/assets/projects/accessories.jpg",
    accent: "from-coral/40 to-sand/10",
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/react.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/javascript.svg" },
      { id: 3, name: "TailwindCSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 4, name: "Rest APIs", path: "/assets/logos/javascript.svg" },
    ],
  },
  {
    id: 10,
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
    id: 11,
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
    name: "Marcus Reyes",
    role: "Founder · Fit From Anywhere",
    body: "Hasnain took our fitness platform from prototype to 1,000+ active users — admin portal, mobile app and backend, all shipped on time. He treated the product like his own.",
    accent: "from-coral to-fuchsia",
  },
  {
    name: "Daniel Cole",
    role: "CTO · Arootah",
    body: "He doesn't just close tickets — he improves the architecture as he goes. Our investment dashboards are faster and far easier to maintain since he joined.",
    accent: "from-royal to-lavender",
  },
  {
    name: "Yannick Mercier",
    role: "Founder · PipPipYalah",
    body: "Real-time matching, dynamic pricing, payments with retries — he engineered the hard parts cleanly and the booking flow just works. Rock-solid delivery.",
    accent: "from-aqua to-royal",
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
