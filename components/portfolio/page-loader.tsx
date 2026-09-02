"use client";

import { useEffect, useState, type FC } from "react";
import { HERO_NAME } from "@/constants/portfolio-constants";

const FIRST_LINE = HERO_NAME.split(" ");

const VISIBLE_MS = 1100;
const SESSION_KEY = "intro-played";

export const PageLoader: FC = () => {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        setRemoved(true);
        return;
      }

      setRemoved(true);
    }, VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (removed) return null;

  return (
    <div className="page-loader fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-primary">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-royal/30 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-coral/25 blur-[140px]" />
      </div>

      <div className="relative flex w-full max-w-3xl flex-col items-center px-6 text-center md:px-10">
        <div className="reveal-pop relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-royal/40 to-coral/40 blur-2xl" />
          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-royal to-coral text-3xl font-black text-white shadow-2xl shadow-coral/30 md:h-20 md:w-20 md:text-4xl">
            H
          </span>
        </div>

        <div className="mt-7 overflow-hidden md:mt-9">
          <div className="flex items-center gap-3 text-3xl font-black tracking-tight md:gap-4 md:text-5xl">
            {FIRST_LINE.map((word, i) => (
              <span
                key={word + i}
                className={`reveal ${i === 0 ? "text-white" : "text-gradient"}`}
                style={{ animationDelay: `${0.06 + i * 0.06}s` }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <p
          className="reveal mt-3 text-[10px] uppercase tracking-[0.4em] text-neutral-400 md:text-xs"
          style={{ animationDelay: "0.16s" }}
        >
          Software Engineer · Building scalable products
        </p>

        <div
          className="reveal mt-10 w-full max-w-md md:mt-12"
          style={{ animationDelay: "0.22s" }}
        >
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-neutral-500">
            <span>Loading</span>
            <span className="intro-count tabular-nums text-white" />
          </div>
          <div className="relative h-[2px] w-full rounded-full bg-white/10">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="intro-fill absolute inset-0 bg-gradient-to-r from-coral via-lavender to-aqua" />
            </div>
            <div className="intro-knob absolute inset-0">
              <span className="absolute -top-1 left-0 -ml-1.5 h-3 w-3 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
            </div>
          </div>
        </div>

        <div
          className="reveal mt-8 flex items-center gap-3"
          style={{ animationDelay: "0.28s" }}
        >
          <span className="block h-2 w-2 rounded-full bg-mint shadow-[0_0_12px_rgba(87,219,150,0.8)]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-400">
            Available for new projects
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 mx-auto flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        <span>© {new Date().getFullYear()}</span>
        <span className="block h-px w-8 bg-white/15" />
        <span>{HERO_NAME}</span>
      </div>
    </div>
  );
};
