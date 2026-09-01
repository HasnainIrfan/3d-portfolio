"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { VIEWPORT_ONCE } from "@/animations/scroll-animations";
import { type SectionHeaderProps } from "@/types/ui-types";

export const SectionHeader: FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  hint,
  className = "",
}) => (
  <div
    className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}
  >
    <div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 0.6 }}
        className="text-eyebrow"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="text-heading mt-3 max-w-3xl"
      >
        {title}
      </motion.h2>
    </div>

    {hint && (
      <motion.p
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 0.6 }}
        className="hidden items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-400 md:flex"
      >
        <span>{hint[0]}</span>
        <span className="block h-px w-10 bg-gradient-to-r from-white/40 to-transparent" />
        <span>{hint[1]}</span>
      </motion.p>
    )}
  </div>
);
