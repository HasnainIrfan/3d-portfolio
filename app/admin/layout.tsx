import { type Metadata } from "next";
import { type ReactNode } from "react";
import { HERO_NAME } from "@/constants/hero-constants";
import {
  ADMIN_DESCRIPTION,
  ADMIN_TITLE,
} from "@/constants/seo-constants";

export const metadata: Metadata = {
  title: {
    default: `${ADMIN_TITLE} · ${HERO_NAME}`,
    template: `%s · Admin · ${HERO_NAME}`,
  },
  description: ADMIN_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    title: `${ADMIN_TITLE} · ${HERO_NAME}`,
    description: ADMIN_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${ADMIN_TITLE} · ${HERO_NAME}`,
    description: ADMIN_DESCRIPTION,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full bg-primary">{children}</div>;
}
