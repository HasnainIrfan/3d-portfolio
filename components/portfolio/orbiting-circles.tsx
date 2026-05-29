"use client";

import { Children, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { type OrbitingCirclesProps } from "@/types/portfolio-types";

export const OrbitingCircles: FC<OrbitingCirclesProps> = ({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  ...props
}) => {
  const calculatedDuration = duration / speed;

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="absolute inset-0 pointer-events-none size-full"
        >
          <circle
            className="stroke-1 stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {Children.map(children, (child, index) => {
        const angle = (360 / Children.count(children)) * index;
        return (
          <div
            key={index}
            style={
              {
                "--duration": calculatedDuration,
                "--radius": radius,
                "--angle": angle,
                "--icon-size": `${iconSize}px`,
              } as React.CSSProperties
            }
            className={twMerge(
              `absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full ${
                reverse ? "[animation-direction:reverse]" : ""
              }`,
              className
            )}
            {...props}
          >
            {child}
          </div>
        );
      })}
    </>
  );
};
