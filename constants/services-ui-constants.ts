/** Gradient washes cycled across the stacked service cards. */
export const SERVICE_ACCENTS = [
  "from-coral via-fuchsia to-royal",
  "from-aqua via-mint to-royal",
  "from-lavender via-fuchsia to-coral",
  "from-sand via-coral to-fuchsia",
] as const;

/** How much each card shrinks per position remaining in the stack. */
export const STACK_SCALE_STEP = 0.04;

/** Vertical offset added per card, so the stack fans rather than aligns. */
export const STACK_OFFSET_REM = 1.25;
