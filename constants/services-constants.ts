import { type Service } from "@/types/portfolio-types";

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Web Applications",
    description:
      "Production-grade Next.js & React apps that are fast, accessible, SEO-friendly and built to scale.",
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
