"use client";

import { useEffect, useState, type FC } from "react";
import { AnimatePresence, motion } from "motion/react";
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

  const classes = twMerge("z-10 inline-block relative text-left", className);

  if (!started) return <span className={classes}>{words[0]}</span>;

  return (
    <AnimatePresence>
      <motion.div
        key={words[index]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          scale: 2,
          position: "absolute",
        }}
        className={classes}
      >
        {words[index].split("").map((letter, letterIndex) => (
          <motion.span
            key={`${words[index]}-${letterIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: letterIndex * 0.05, duration: 0.2 }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
