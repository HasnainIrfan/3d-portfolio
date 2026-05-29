"use client";

import { useRef, type FC } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react";
import { Marquee } from "@/components/portfolio/marquee";
import {
  HERO_LOCATION,
  HERO_NAME,
  SKILL_CHIPS,
  STATS,
} from "@/constants/portfolio-constants";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const StatCard: FC<{ value: string; label: string; index: number }> = ({
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
      variants={fadeUp}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="glass gradient-border p-6 md:p-7"
    >
      <p className="text-4xl md:text-5xl font-extrabold text-gradient">
        {value}
      </p>
      <p className="mt-2 text-sm md:text-base text-neutral-400">{label}</p>
    </motion.div>
  );
};

export const About: FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const bioInView = useInView(bioRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const auroraY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const auroraOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.2, 0.6, 0.2]
  );

  return (
    <section
      ref={sectionRef}
      className="c-space section-spacing relative overflow-hidden"
      id="about"
    >
      <motion.div
        aria-hidden
        style={{ y: auroraY, opacity: auroraOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-royal/30 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-coral/20 blur-[140px]" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-eyebrow"
      >
        About
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="text-heading mt-3 max-w-4xl"
      >
        Engineering products that <span className="text-gradient">people actually use.</span>
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12 items-start">
        <motion.div
          ref={bioRef}
          initial="hidden"
          animate={bioInView ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 glass gradient-border p-8 md:p-10"
        >
          <p className="text-sm tracking-[0.25em] uppercase text-neutral-400 mb-3">
            Who I Am
          </p>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {HERO_NAME} · {HERO_LOCATION}
          </h3>
          <p className="text-neutral-300 leading-relaxed text-base md:text-lg">
            I&apos;m a Software Engineer with{" "}
            <span className="text-white font-semibold">3+ years</span> of
            experience designing and shipping production-grade web and mobile
            products. I lead with clean code, sharp problem-solving and a deep
            care for the user experience.
          </p>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            From{" "}
            <span className="text-white">Front-End Developer</span> to{" "}
            <span className="text-white">Junior Team Lead</span>, and now{" "}
            <span className="text-white">Software Engineer at Getweys</span>,
            I&apos;ve led teams, mentored developers, and contributed to
            architecture decisions that kept codebases scalable and
            maintainable.
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

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-eyebrow">My Toolkit</p>
          <div className="h-px flex-1 ml-6 bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
        </motion.div>

        <div className="relative overflow-hidden">
          <Marquee className="[--duration:35s] [--gap:1rem]" pauseOnHover>
            {SKILL_CHIPS.map((skill) => (
              <span
                key={skill}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-sm md:text-base text-neutral-200 whitespace-nowrap hover:border-white/30 hover:bg-white/[0.08] transition-colors"
              >
                {skill}
              </span>
            ))}
          </Marquee>
          <Marquee
            reverse
            className="[--duration:40s] [--gap:1rem] mt-3"
            pauseOnHover
          >
            {SKILL_CHIPS.slice()
              .reverse()
              .map((skill) => (
                <span
                  key={`r-${skill}`}
                  className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-sm md:text-base text-neutral-200 whitespace-nowrap hover:border-white/30 hover:bg-white/[0.08] transition-colors"
                >
                  {skill}
                </span>
              ))}
          </Marquee>
          <div className="absolute inset-y-0 left-0 w-1/6 pointer-events-none bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/6 pointer-events-none bg-gradient-to-l from-primary to-transparent" />
        </div>
      </div>
    </section>
  );
};
