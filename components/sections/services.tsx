"use client";

import { useRef, type FC } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { type Service } from "@/types/portfolio-types";
import { SERVICES } from "@/constants/portfolio-constants";

const ACCENTS = [
  "from-coral via-fuchsia to-royal",
  "from-aqua via-mint to-royal",
  "from-lavender via-fuchsia to-coral",
  "from-sand via-coral to-fuchsia",
];

const StackCard: FC<{
  service: Service;
  index: number;
  total: number;
}> = ({ service, index, total }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1 - (total - index) * 0.04]
  );
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0.7]);

  const top = `calc(8rem + ${index * 1.25}rem)`;

  return (
    <div ref={ref} className="sticky" style={{ top }}>
      <motion.article
        style={{ scale, opacity }}
        className="relative h-[80vh] md:h-[78vh] overflow-hidden rounded-3xl border border-white/10 bg-midnight"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[index % ACCENTS.length]} opacity-30`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.5),transparent_45%)]" />

        <div className="relative h-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 lg:p-16">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 border border-white/20 rounded-full px-3 py-1">
                  Service {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span className="block h-px w-12 bg-white/30" />
              </div>

              <h3 className="mt-6 text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                {service.title}
              </h3>
              <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                {service.description}
              </p>
            </div>

            <div className="mt-8">
              <a
                href="#contact"
                className="group inline-flex items-center gap-4 text-white"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:scale-110">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 -rotate-45"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="text-base md:text-lg font-medium tracking-tight">
                  Start this project
                </span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="relative flex items-start justify-end">
              <span className="text-[7rem] md:text-[10rem] font-black leading-none text-white/10 tracking-tighter">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="absolute top-4 right-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md flex items-center justify-center">
                <img
                  src={service.icon}
                  alt=""
                  className="w-8 h-8 md:w-9 md:h-9 opacity-90"
                />
              </div>
            </div>

            <ul className="space-y-3">
              <li className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">
                What&apos;s included
              </li>
              {service.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3 text-sm md:text-base text-white/85"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] flex-shrink-0" />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
      </motion.article>
    </div>
  );
};

export const Services: FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const auroraY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const auroraOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.3, 0.7, 0.3]
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative c-space section-spacing overflow-visible"
    >
      <motion.div
        aria-hidden
        style={{ y: auroraY, opacity: auroraOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-lavender/20 blur-[140px]" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-aqua/15 blur-[140px]" />
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-eyebrow"
          >
            Services · {String(SERVICES.length).padStart(2, "0")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-heading mt-3 max-w-3xl"
          >
            What I can build for you,{" "}
            <span className="text-gradient">end-to-end.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-400"
        >
          <span>Scroll</span>
          <span className="block h-px w-10 bg-gradient-to-r from-white/40 to-transparent" />
          <span>Stack</span>
        </motion.p>
      </div>

      <div className="relative space-y-6 md:space-y-8">
        {SERVICES.map((service, i) => (
          <StackCard
            key={service.id}
            service={service}
            index={i}
            total={SERVICES.length}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="mt-24 glass gradient-border p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10"
      >
        <div>
          <p className="text-eyebrow mb-2">Have a different idea?</p>
          <h3 className="text-2xl md:text-3xl font-bold">
            Let&apos;s scope it together.
          </h3>
          <p className="mt-2 text-neutral-400 max-w-xl">
            Send me a brief — I&apos;ll reply within 24 hours with a realistic
            plan, timeline and price.
          </p>
        </div>
        <a href="#contact" className="btn-primary">
          <span>Place an order</span>
          <span aria-hidden>→</span>
        </a>
      </motion.div>
    </section>
  );
};
