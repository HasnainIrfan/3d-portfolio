import type { MetadataRoute } from "next";
import { HERO_NAME } from "@/constants/hero-constants";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/constants/seo-constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: HERO_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#030412",
    theme_color: "#5c33cc",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
