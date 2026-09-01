import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hasnain Irfan | Software Engineer",
    short_name: "Hasnain Irfan",
    description:
      "Software Engineer building scalable web & mobile products with React, Next.js, React Native and Node.js.",
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
