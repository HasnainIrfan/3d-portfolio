"use client";

import dynamic from "next/dynamic";
import { type FC } from "react";
import { useDeferred3D } from "@/hooks/use-deferred-3d";
import { GlobePoster } from "./globe-poster";

const ThemedGlobe = dynamic(
  () => import("./themed-globe").then((mod) => mod.ThemedGlobe),
  { ssr: false }
);

export const GlobeLayer: FC = () => {
  // Stage 1: the hero canvas claims the first idle slot, the backdrop the next.
  const isInteractive = useDeferred3D(1);

  return isInteractive ? <ThemedGlobe /> : <GlobePoster />;
};
