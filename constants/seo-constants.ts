import { HERO_LOCATION, HERO_NAME, HERO_ROLE } from "./hero-constants";
import { CONTACT_EMAIL, MY_SOCIALS } from "./social-constants";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hasnainirfan.com"
).replace(/\/$/, "");

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const SITE_NAME = `${HERO_NAME} | ${HERO_ROLE}`;

export const SITE_TITLE = `${HERO_NAME} | ${HERO_ROLE}`;

export const SITE_DESCRIPTION =
  "Senior Software Engineer with 5+ years building scalable web and mobile products in React, Next.js and Node.js. Open to freelance and contract work.";

export const SITE_TAGLINE =
  "Scalable web & mobile products built with React, Next.js and Node.js.";

export const OG_IMAGE = "/og.jpg";
export const OG_IMAGE_ALT = `${HERO_NAME}, ${HERO_ROLE} portfolio`;
export const OG_LOCALE = "en_US";

export const OG_IMAGES = [
  {
    url: OG_IMAGE,
    width: 1200,
    height: 630,
    alt: OG_IMAGE_ALT,
  },
];

export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";

export const SITE_KEYWORDS = [
  HERO_NAME,
  "Software Engineer",
  "Senior Software Engineer",
  "Full Stack Developer",
  "Next.js Developer",
  "React Developer",
  "React Native Developer",
  "Node.js Developer",
  "Frontend Developer",
  "Web Developer Portfolio",
  "Freelance Developer",
  "Hire Software Engineer",
  HERO_LOCATION,
  "Pakistan",
  "Remote Developer",
];

export const HOME_TITLE = `${HERO_NAME} | ${HERO_ROLE} & Next.js Developer`;

export const HOME_DESCRIPTION =
  "Senior Software Engineer in Karachi building scalable web, mobile and API products with React, Next.js and Node.js. Open to freelance and contract work.";

export const ADMIN_TITLE = "Contact submissions";

export const ADMIN_DESCRIPTION =
  "Private dashboard for contact form submissions. Not part of the public site.";

export const ADMIN_LOGIN_TITLE = "Sign in";

export const ADMIN_LOGIN_DESCRIPTION =
  "Sign in to the private contact submissions dashboard.";

export const SITE_SECTIONS = [
  {
    name: "Home",
    hash: "#home",
    description: `${HERO_NAME}, ${HERO_ROLE} building scalable web and mobile products.`,
  },
  {
    name: "About",
    hash: "#about",
    description: `Background, stack and working style of ${HERO_NAME}, a ${HERO_ROLE} based in ${HERO_LOCATION}.`,
  },
  {
    name: "Services",
    hash: "#services",
    description:
      "Web applications, cross-platform mobile apps, APIs and technical consulting for startups and product teams.",
  },
  {
    name: "Work",
    hash: "#work",
    description:
      "Selected projects and case studies built with React, Next.js, React Native and Node.js.",
  },
  {
    name: "Testimonials",
    hash: "#testimonials",
    description: `What clients and teammates say about working with ${HERO_NAME}.`,
  },
  {
    name: "Contact",
    hash: "#contact",
    description: `Get in touch with ${HERO_NAME} about freelance, contract or full-time work.`,
  },
] as const;

export const SOCIAL_PROFILES = MY_SOCIALS.map((social) => social.href);

export const CONTACT_POINT_EMAIL = CONTACT_EMAIL;
