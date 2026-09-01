import { type Transition, type Variants } from "motion/react";

/** Springs used for interactive controls, where a duration would feel canned. */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
};

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 18,
};

/** Swap one label for another in place — used by the submit button. */
export const swapLabel: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** The focus underline that wipes in beneath a field. */
export const underlineWipe: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
  exit: { scaleX: 0 },
};

export const UNDERLINE_TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeOut",
};
