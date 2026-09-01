"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { formatCounter } from "@/helpers/format-helpers";
import { type ProjectSummaryProps } from "@/types/project-types";

/** Repeats as each panel scrolls in, so `once` is deliberately false here. */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.4 },
  transition: { duration: 0.6, delay },
});

/** The text column of a project panel. */
export const ProjectSummary: FC<ProjectSummaryProps> = ({
  project,
  index,
  total,
  onOpen,
}) => (
  <div className="order-2 lg:order-1 lg:col-span-5">
    <motion.p
      {...reveal()}
      transition={{ duration: 0.5 }}
      className="text-[10px] uppercase tracking-[0.4em] text-neutral-400"
    >
      {formatCounter(index, total)} · {project.category}
    </motion.p>

    <motion.h3
      {...reveal()}
      className="mt-3 text-4xl font-bold leading-[1.05] text-white md:text-6xl"
    >
      {project.title}
    </motion.h3>

    <motion.p
      {...reveal(0.1)}
      className="mt-5 max-w-xl leading-relaxed text-neutral-400"
    >
      {project.description}
    </motion.p>

    <motion.div {...reveal(0.2)} className="mt-6 flex flex-wrap gap-2">
      {project.tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300"
        >
          {tag.name}
        </span>
      ))}
    </motion.div>

    <motion.div {...reveal(0.3)} className="mt-7 flex flex-wrap gap-3">
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
      >
        <span>Visit Live</span>
        <span aria-hidden>↗</span>
      </a>
      <button type="button" onClick={onOpen} className="btn-ghost">
        <span>Case study</span>
      </button>
    </motion.div>
  </div>
);
