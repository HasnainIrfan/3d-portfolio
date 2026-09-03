"use client";

import { useCallback, type FC } from "react";
import { Canvas, type RootState } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { twMerge } from "tailwind-merge";
import {
  CAMERA_DISTANCE,
  CAMERA_FOV,
  INSTANCE_COUNT,
} from "@/constants/globe-constants";
import { type ThemedGlobeProps } from "@/types/portfolio-types";
import { useSceneActive } from "@/hooks/use-scene-active";
import { GlobeScene } from "./globe-scene";
import { GlobeScrim } from "./globe-scrim";

export const ThemedGlobe: FC<ThemedGlobeProps> = ({ className }) => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isTablet = useMediaQuery({ maxWidth: 1280 });
  const prefersReducedMotion = useReducedMotion();
  const active = useSceneActive();

  const count = isMobile
    ? INSTANCE_COUNT.mobile
    : isTablet
      ? INSTANCE_COUNT.tablet
      : INSTANCE_COUNT.desktop;

  const handleCreated = useCallback((state: RootState) => {
    state.gl.setClearColor(0x000000, 0);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={twMerge("pointer-events-none fixed inset-0 z-0", className)}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, CAMERA_DISTANCE],
          near: 0.1,
          far: 60,
          fov: CAMERA_FOV,
        }}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          alpha: true,
        }}
        frameloop={active ? "always" : "never"}
        onCreated={handleCreated}
      >
        <GlobeScene
          count={count}
          paused={Boolean(prefersReducedMotion)}
          compact={isMobile}
        />
      </Canvas>

      <GlobeScrim />
    </div>
  );
};
