"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { revealProps } from "@/animations/scroll-animations";

export const ServicesCtaCard: FC = () => (
  <motion.div
    {...revealProps()}
    className="glass gradient-border relative z-10 mt-24 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10"
  >
    <div>
      <p className="text-eyebrow mb-2">Have a different idea?</p>
      <h3 className="text-2xl font-bold md:text-3xl">
        Let&apos;s scope it together.
      </h3>
      <p className="mt-2 max-w-xl text-neutral-400">
        Send me a brief and I&apos;ll reply within 24 hours with a realistic plan,
        timeline and price.
      </p>
    </div>
    <a href="#contact" className="btn-primary">
      <span>Place an order</span>
      <span aria-hidden>→</span>
    </a>
  </motion.div>
);
