import { type Transition, type Variants } from "motion/react";

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

export const swapLabel: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const underlineWipe: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
  exit: { scaleX: 0 },
};

export const UNDERLINE_TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeOut",
};
