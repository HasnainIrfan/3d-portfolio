"use client";

import { useEffect, useState, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { type FlipWordsProps } from "@/types/portfolio-types";

export const FlipWords: FC<FlipWordsProps> = ({
  words,
  duration = 3000,
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStarted(true);
      setIndex((current) => (current + 1) % words.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [duration, words.length]);

  return (
    <span className={twMerge("relative z-10 inline-grid text-left", className)}>
      {/* Every word sits in the one grid cell, so the row is always as wide as
          the widest of them. Without this the hero reflows on each swap, and
          a word that paints a larger block than its predecessor becomes a new
          Largest Contentful Paint candidate - which is how a rotating word ends
          up pushing LCP out by one interval, forever. */}
      {words.map((word) => (
        <span
          key={word}
          aria-hidden
          className="invisible col-start-1 row-start-1"
        >
          {word}
        </span>
      ))}

      <span
        key={index}
        className={twMerge("col-start-1 row-start-1", started && "flip-word")}
      >
        {words[index]}
      </span>
    </span>
  );
};
