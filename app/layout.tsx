import type { Metadata, Viewport } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hasnain Irfan | Software Engineer",
  description:
    "Software Engineer with 3+ years of experience designing and shipping scalable web & mobile products with React, Next.js, React Native and Node.js. Available for projects.",
  keywords: [
    "Hasnain Irfan",
    "Software Engineer",
    "Next.js Developer",
    "React Developer",
    "React Native Developer",
    "Full Stack Developer",
    "Karachi",
    "Pakistan",
    "Hire developer",
  ],
  authors: [{ name: "Hasnain Irfan" }],
  openGraph: {
    title: "Hasnain Irfan — Software Engineer",
    description:
      "Scalable web & mobile products built with React, Next.js and Node.js.",
    type: "website",
  },
};

export const viewport: Viewport = {
  // Tints mobile browser chrome to match the site's brand gradient.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030412" },
    { media: "(prefers-color-scheme: light)", color: "#5c33cc" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${funnelDisplay.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
