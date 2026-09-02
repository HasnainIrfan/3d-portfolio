import type { Metadata, Viewport } from "next";
import { Funnel_Display } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { HERO_NAME } from "@/constants/hero-constants";
import {
  GOOGLE_SITE_VERIFICATION,
  OG_IMAGES,
  OG_LOCALE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from "@/constants/seo-constants";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${HERO_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: HERO_NAME, url: SITE_URL }],
  creator: HERO_NAME,
  publisher: HERO_NAME,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    locale: OG_LOCALE,
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    images: OG_IMAGES,
  },
  category: "technology",
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030412" },
    { media: "(prefers-color-scheme: light)", color: "#5c33cc" },
  ],
  colorScheme: "dark",
};

const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem("intro-played")==="1"){document.documentElement.dataset.introPlayed="1"}}catch(e){}`;

const NOSCRIPT_CSS = `
  .page-loader { display: none !important; }
  #site-content [style] {
    opacity: 1 !important;
    filter: none !important;
    transform: none !important;
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${funnelDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }}
        />
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
