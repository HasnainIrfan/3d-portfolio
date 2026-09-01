/** Tuning for the toolkit marquee at the foot of the About section. */
export const MARQUEE = {
  forward: "[--duration:35s] [--gap:1rem]",
  reverse: "[--duration:40s] [--gap:1rem] mt-3",
} as const;

/** Shared chip styling, used by both marquee rows. */
export const SKILL_CHIP_CLASS =
  "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-neutral-200 transition-colors hover:border-white/30 hover:bg-white/[0.08] md:text-base";
