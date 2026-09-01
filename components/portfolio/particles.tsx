"use client";

import { type FC } from "react";
import { twMerge } from "tailwind-merge";
import { useParticleField } from "@/hooks/use-particle-field";
import { type ParticlesProps } from "@/types/portfolio-types";

/** Decorative drifting particles that lean toward the cursor. */
export const Particles: FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  ...props
}) => {
  const { containerRef, canvasRef } = useParticleField({
    quantity,
    staticity,
    ease,
    size,
    color,
    vx,
    vy,
    refresh,
  });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={twMerge("pointer-events-none", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};
