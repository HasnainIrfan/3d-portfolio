import { type FC } from "react";
import {
  CONTACT_POINT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/constants/seo-constants";
import {
  HERO_LOCATION,
  HERO_NAME,
  HERO_ROLE,
} from "@/constants/hero-constants";
import { SERVICES } from "@/constants/services-constants";
import { SKILL_CHIPS } from "@/constants/skills-constants";

const [city, country] = HERO_LOCATION.split(",").map((part) => part.trim());

const person = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: HERO_NAME,
  jobTitle: HERO_ROLE,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: `mailto:${CONTACT_POINT_EMAIL}`,
  image: `${SITE_URL}/og.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: city,
    addressCountry: country,
  },
  knowsAbout: SKILL_CHIPS,
  sameAs: SOCIAL_PROFILES,
};

const website = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#person` },
};

const profilePage = {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: SITE_NAME,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  primaryImageOfPage: `${SITE_URL}/og.jpg`,
};

const professionalService = {
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#service`,
  name: `${HERO_NAME} Web & Mobile Development`,
  url: SITE_URL,
  provider: { "@id": `${SITE_URL}/#person` },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: SERVICES.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
  },
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [person, website, profilePage, professionalService],
};

export const JsonLd: FC = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
  />
);
