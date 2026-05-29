"use client";

import { useEffect, useState, type FC } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "motion/react";
import { HERO_NAME } from "@/constants/portfolio-constants";

const FIRST_LINE = HERO_NAME.split(" ");

const DURATION_MS = 2200;

export const PageLoader: FC = () => {
  const [done, setDone] = useState(false);
  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, {
    stiffness: 60,
    damping: 18,
  });
  const percent = useTransform(progressSpring, (v) => Math.round(v));
  const widthPct = useTransform(progressSpring, (v) => `${v}%`);

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: DURATION_MS / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    const t = setTimeout(() => setDone(true), DURATION_MS + 250);
    document.documentElement.style.overflow = "hidden";
    return () => {
      controls.stop();
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [progress]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
      }}
    >
      {!done && (
        <motion.div
          key="page-loader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary overflow-hidden"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-royal/30 blur-[140px]" />
            <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-coral/25 blur-[140px]" />
          </motion.div>

          <div className="relative w-full max-w-3xl px-6 md:px-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.05,
              }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-royal/40 to-coral/40 blur-2xl" />
              <span className="relative inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-royal to-coral text-white font-black text-3xl md:text-4xl shadow-2xl shadow-coral/30">
                H
              </span>
            </motion.div>

            <div className="mt-7 md:mt-9 overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.25,
                }}
                className="flex items-center gap-3 md:gap-4 text-3xl md:text-5xl font-black tracking-tight"
              >
                {FIRST_LINE.map((word, i) => (
                  <motion.span
                    key={word + i}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.45 + i * 0.12,
                    }}
                    className={
                      i === 0 ? "text-white" : "text-gradient"
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-3 text-[10px] md:text-xs tracking-[0.4em] uppercase text-neutral-400"
            >
              Software Engineer · Building scalable products
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-10 md:mt-12 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-2 text-[10px] tracking-[0.4em] uppercase text-neutral-500">
                <span>Loading</span>
                <span className="text-white tabular-nums">
                  <motion.span>{percent}</motion.span>%
                </span>
              </div>
              <div className="relative h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  style={{ width: widthPct }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral via-lavender to-aqua"
                />
                <motion.div
                  style={{ left: widthPct }}
                  className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-8 flex items-center gap-3"
            >
              <span className="block h-2 w-2 rounded-full bg-mint shadow-[0_0_12px_rgba(87,219,150,0.8)]" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-400">
                Available for new projects
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-6 left-0 right-0 mx-auto flex items-center justify-center gap-3 text-[10px] tracking-[0.3em] uppercase text-neutral-500"
          >
            <span>© {new Date().getFullYear()}</span>
            <span className="block h-px w-8 bg-white/15" />
            <span>Hasnain Irfan</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
