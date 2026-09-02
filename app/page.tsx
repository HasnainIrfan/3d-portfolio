import { type Metadata } from "next";
import { HomePage } from "@/components/portfolio/home-page";
import { HERO_NAME } from "@/constants/hero-constants";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGES,
  OG_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/constants/seo-constants";

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    locale: OG_LOCALE,
    images: OG_IMAGES,
    firstName: HERO_NAME.split(" ")[0],
    lastName: HERO_NAME.split(" ").slice(1).join(" "),
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: OG_IMAGES,
  },
};

export default function Home() {
  return <HomePage />;
}
