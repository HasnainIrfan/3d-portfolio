"use client";

import { type FC } from "react";
import { motion } from "motion/react";

export const ServiceBullets: FC<{ bullets: string[] }> = ({ bullets }) => (
  <ul className="space-y-3">
    <li className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
      What&apos;s included
    </li>
    {bullets.map((bullet, index) => (
      <motion.li
        key={bullet}
        initial={{ opacity: 0, x: 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="flex items-start gap-3 text-sm text-white/85 md:text-base"
      >
        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        <span>{bullet}</span>
      </motion.li>
    ))}
  </ul>
);
