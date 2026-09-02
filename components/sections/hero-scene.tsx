"use client";

import { Suspense, type FC } from "react";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Astronaut } from "@/components/portfolio/astronaut";
import { Loader } from "@/components/portfolio/loader";

const Rig: FC = () => {
  useFrame((state: RootState, delta: number) => {
    easing.damp3(
      state.camera.position,
      [state.mouse.x / 10, 1 + state.mouse.y / 10, 3],
      0.5,
      delta
    );
  });
  return null;
};

export const HeroScene: FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });

  return (
    <figure
      className="absolute inset-0"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Canvas camera={{ position: [0, 1, 3] }}>
        <Suspense fallback={<Loader />}>
          <Float>
            <Astronaut
              scale={isMobile ? 0.23 : undefined}
              position={isMobile ? [0, -1.5, 0] : undefined}
            />
          </Float>
          <Rig />
        </Suspense>
      </Canvas>
    </figure>
  );
};
