import { type Variants } from "motion/react";

export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const fadeInUpSmall: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

export const revealProps = (delay = 0) => ({
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: VIEWPORT_ONCE,
  variants: fadeInUp,
  transition: { duration: 0.7, delay },
});
