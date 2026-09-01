"use client";

import { useRef, type FC } from "react";
import { motion, useInView } from "motion/react";
import { fadeInUp } from "@/animations/scroll-animations";
import { HERO_LOCATION, HERO_NAME } from "@/constants/hero-constants";

export const AboutBio: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.7 }}
      className="glass gradient-border p-8 md:p-10 lg:col-span-7"
    >
      <p className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-400">
        Who I Am
      </p>
      <h3 className="mb-4 text-2xl font-bold md:text-3xl">
        {HERO_NAME} · {HERO_LOCATION}
      </h3>
      <p className="text-base leading-relaxed text-neutral-300 md:text-lg">
        I&apos;m a Senior Software Engineer with{" "}
        <span className="font-semibold text-white">5+ years</span> of experience
        designing and shipping production-grade web and mobile products. I lead
        with clean code, sharp problem-solving and a deep care for the user
        experience.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-400">
        From <span className="text-white">Front-End Developer</span> to{" "}
        <span className="text-white">Junior Team Lead</span>, and now{" "}
        <span className="text-white">Senior Software Engineer at Getweys</span>,
        I&apos;ve led teams, mentored developers, and contributed to architecture
        decisions that kept codebases scalable and maintainable.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#contact" className="btn-primary">
          <span>Start a project</span>
          <span aria-hidden>→</span>
        </a>
        <a href="#work" className="btn-ghost">
          <span>See past work</span>
        </a>
      </div>
    </motion.div>
  );
};
