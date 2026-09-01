import { HERO_LOCATION, HERO_NAME, HERO_ROLE } from "./hero-constants";
import { CONTACT_EMAIL, MY_SOCIALS } from "./social-constants";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hasnaindeveloper.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = `${HERO_NAME} — ${HERO_ROLE}`;

export const SITE_TITLE = `${HERO_NAME} | ${HERO_ROLE}`;

export const SITE_DESCRIPTION =
  "Senior Software Engineer with 5+ years building scalable web and mobile products with React, Next.js, React Native and Node.js. Available for freelance and contract work worldwide.";

export const SITE_TAGLINE =
  "Scalable web & mobile products built with React, Next.js and Node.js.";

export const OG_IMAGE = "/og.jpg";
export const OG_IMAGE_ALT = `${HERO_NAME} — ${HERO_ROLE} portfolio`;

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

export const SOCIAL_PROFILES = MY_SOCIALS.map((social) => social.href);

export const CONTACT_POINT_EMAIL = CONTACT_EMAIL;
