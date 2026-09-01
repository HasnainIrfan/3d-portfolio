import { type Variants } from "motion/react";

/**
 * Shared scroll-reveal presets.
 *
 * `once: true` throughout — a section that re-animates every time it re-enters
 * the viewport reads as a glitch on the way back up the page.
 */
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;

/** The section-level reveal: everything anchored to the same rhythm. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

/** Smaller travel, for items inside an already-revealed block. */
export const fadeInUpSmall: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/** Parent that walks its children in one after another. */
export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

/** Props for a one-off reveal, spread straight onto a `motion` element. */
export const revealProps = (delay = 0) => ({
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: VIEWPORT_ONCE,
  variants: fadeInUp,
  transition: { duration: 0.7, delay },
});
