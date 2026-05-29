"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { FlipWords } from "@/components/portfolio/flip-words";
import {
  FLIP_WORDS,
  HERO_NAME,
  HERO_ROLE,
} from "@/constants/portfolio-constants";

const variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const HeroText: FC = () => {
  return (
    <div className="z-10 mt-24 text-center md:mt-32 md:text-left max-w-3xl">
      <div className="flex-col hidden md:flex c-space">
        <motion.div
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md px-3 py-1.5 mb-6"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-mint animate-ping opacity-75" />
            <span className="relative rounded-full bg-mint h-2 w-2" />
          </span>
          <span className="text-xs tracking-[0.25em] uppercase text-neutral-300">
            Available for new projects
          </span>
        </motion.div>

        <motion.h1
          className="text-3xl font-light text-neutral-400"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Hi, I&apos;m {HERO_NAME.split(" ")[0]} —
        </motion.h1>

        <motion.p
          className="text-5xl lg:text-6xl font-bold mt-2 text-gradient leading-tight"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          {HERO_ROLE} <br />
          crafting
        </motion.p>

        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          <FlipWords
            words={[...FLIP_WORDS]}
            className="font-black text-white text-7xl lg:text-8xl"
          />
        </motion.div>

        <motion.p
          className="text-3xl lg:text-4xl font-semibold text-neutral-300"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.7, duration: 0.7 }}
        >
          web & mobile products.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 mt-10"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 2.0, duration: 0.7 }}
        >
          <a href="#contact" className="btn-primary">
            <span>Hire Me</span>
            <span aria-hidden>→</span>
          </a>
          <a href="#work" className="btn-ghost">
            <span>View My Work</span>
          </a>
        </motion.div>
      </div>

      <div className="flex flex-col space-y-5 md:hidden px-2">
        <motion.div
          className="inline-flex self-center items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-mint animate-ping opacity-75" />
            <span className="relative rounded-full bg-mint h-2 w-2" />
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-300">
            Open for Work
          </span>
        </motion.div>
        <motion.p
          className="text-3xl font-light text-neutral-400"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9 }}
        >
          Hi, I&apos;m {HERO_NAME.split(" ")[0]}
        </motion.p>
        <motion.p
          className="text-4xl font-bold text-gradient"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.1 }}
        >
          {HERO_ROLE}
        </motion.p>
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.4 }}
        >
          <FlipWords
            words={[...FLIP_WORDS]}
            className="font-bold text-white text-5xl"
          />
        </motion.div>
        <motion.p
          className="text-3xl font-semibold text-neutral-300"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.7 }}
        >
          web & mobile apps.
        </motion.p>
        <motion.div
          className="flex flex-col gap-3 mt-4 items-center"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 2.0 }}
        >
          <a href="#contact" className="btn-primary w-full">
            <span>Hire Me</span>
            <span aria-hidden>→</span>
          </a>
          <a href="#work" className="btn-ghost w-full">
            <span>View My Work</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
};
