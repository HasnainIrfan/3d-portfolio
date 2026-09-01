"use client";

import { useRef, type FC } from "react";
import { motion, useInView } from "motion/react";
import { fadeInUp } from "@/animations/scroll-animations";
import { type Stat } from "@/types/portfolio-types";

export const AboutStatCard: FC<Stat & { index: number }> = ({
  value,
  label,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="glass gradient-border p-6 md:p-7"
    >
      <p className="text-4xl font-extrabold text-gradient md:text-5xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-neutral-400 md:text-base">{label}</p>
    </motion.div>
  );
};
