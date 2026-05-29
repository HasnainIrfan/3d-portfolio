"use client";

import {
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useMediaQuery } from "react-responsive";
import { ProjectDetails } from "@/components/portfolio/project-details";
import { MY_PROJECTS } from "@/constants/portfolio-constants";
import { type Project } from "@/types/portfolio-types";

const ProjectPanel: FC<{
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
  showPreview: boolean;
}> = ({ project, index, total, onOpen, showPreview }) => {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), {
    stiffness: 200,
    damping: 18,
  });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div className="shrink-0 w-screen h-screen flex items-center justify-center px-6 md:px-20">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] tracking-[0.4em] uppercase text-neutral-400"
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {project.category}
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mt-3 text-4xl md:text-6xl font-bold text-white leading-[1.05]"
          >
            {project.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-neutral-400 leading-relaxed max-w-xl"
          >
            {project.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {project.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300"
              >
                {t.name}
              </span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <span>Visit Live</span>
              <span aria-hidden>↗</span>
            </a>
            <button onClick={onOpen} className="btn-ghost">
              <span>Case study</span>
            </button>
          </motion.div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2">
          <div style={{ perspective: "1400px" }} className="relative">
            <motion.div
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
              className="relative aspect-[4/3] md:aspect-[16/10] rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 bg-midnight"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${project.accent} opacity-40`}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-[10rem] md:text-[14rem] font-black text-white/10 leading-none tracking-tighter">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {showPreview && (
                <div className="absolute inset-0">
                  <iframe
                    src={project.href}
                    title={project.title}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer"
                    className="pointer-events-none select-none origin-top-left bg-transparent"
                    style={{
                      width: "180%",
                      height: "180%",
                      transform: "scale(0.555)",
                      transformOrigin: "top left",
                      border: "0",
                      colorScheme: "normal",
                    }}
                  />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_45%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.35),transparent_45%)]" />

              <motion.div
                style={{ transform: "translateZ(70px)" }}
                className="pointer-events-none absolute top-5 left-5 right-5 flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-mint animate-ping opacity-75" />
                    <span className="relative rounded-full bg-mint h-1.5 w-1.5" />
                  </span>
                  Live Preview
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/70 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/15">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </motion.div>

              <motion.a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ transform: "translateZ(80px)" }}
                className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 backdrop-blur-md px-4 py-2 text-xs text-white hover:border-white/40"
              >
                <span>Open Site</span>
                <span aria-hidden>↗</span>
              </motion.a>

              <motion.div
                style={{ transform: "translateZ(50px)" }}
                className="pointer-events-none absolute bottom-5 left-5 text-white/85 text-xs tracking-widest uppercase bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/15"
              >
                {project.title}
              </motion.div>

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PinnedHorizontalShowcase: FC<{
  onOpen: (p: Project) => void;
}> = ({ onOpen }) => {
  const total = MY_PROJECTS.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const progress = useMotionValue(0);
  const xSpring = useSpring(
    useTransform(progress, [0, 1], ["0vw", `-${(total - 1) * 100}vw`]),
    { stiffness: 60, damping: 20 }
  );
  const progressScale = useSpring(progress, { stiffness: 60, damping: 20 });

  useEffect(() => {
    let rafId: number | null = null;
    let lastIndex = -1;

    const compute = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) {
        progress.set(0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const p = scrolled / scrollable;
      progress.set(p);

      const idx = Math.min(
        total - 1,
        Math.max(0, Math.round(p * (total - 1)))
      );
      if (idx !== lastIndex) {
        lastIndex = idx;
        setActiveIndex(idx);
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
    };
  }, [progress, total]);

  return (
    <div
      ref={trackRef}
      style={{ height: `${total * 100}vh` }}
      className="relative mt-10"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-0 h-72 w-72 rounded-full bg-royal/10 blur-[140px]" />
          <div className="absolute bottom-1/3 right-0 h-80 w-80 rounded-full bg-coral/10 blur-[140px]" />
        </div>

        <motion.div
          style={{ x: xSpring }}
          className="flex h-full will-change-transform"
        >
          {MY_PROJECTS.map((project, i) => (
            <ProjectPanel
              key={project.id}
              project={project}
              index={i}
              total={total}
              onOpen={() => onOpen(project)}
              showPreview={Math.abs(i - activeIndex) <= 1}
            />
          ))}
        </motion.div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <motion.div
            style={{ scaleX: progressScale, transformOrigin: "0% 50%" }}
            className="h-[3px] bg-gradient-to-r from-coral via-lavender to-royal"
          />
        </div>
      </div>
    </div>
  );
};

const LazyVerticalPanel: FC<{
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
}> = ({ project, index, total, onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <ProjectPanel
        project={project}
        index={index}
        total={total}
        onOpen={onOpen}
        showPreview={visible}
      />
    </div>
  );
};

const VerticalProjects: FC<{ onOpen: (p: Project) => void }> = ({ onOpen }) => (
  <div className="space-y-20 mt-12">
    {MY_PROJECTS.map((project, i) => (
      <LazyVerticalPanel
        key={project.id}
        project={project}
        index={i}
        total={MY_PROJECTS.length}
        onOpen={() => onOpen(project)}
      />
    ))}
  </div>
);

export const Projects: FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 1023 });
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Project | null>(null);
  const total = MY_PROJECTS.length;

  useEffect(() => setMounted(true), []);

  const useHorizontal = mounted && !isMobile;

  return (
    <section id="work" className="relative">
      <div className="c-space pt-24 md:pt-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="text-eyebrow"
            >
              Selected Work · {String(total).padStart(2, "0")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-heading mt-3 max-w-3xl"
            >
              Projects that{" "}
              <span className="text-gradient">shipped & scaled.</span>
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
            <span>Pinned</span>
          </motion.p>
        </div>
      </div>

      {useHorizontal ? (
        <PinnedHorizontalShowcase onOpen={setActive} />
      ) : (
        <div className="c-space">
          <VerticalProjects onOpen={setActive} />
        </div>
      )}

      {active && (
        <ProjectDetails {...active} closeModal={() => setActive(null)} />
      )}
    </section>
  );
};
