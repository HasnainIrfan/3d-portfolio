import { type ReactNode } from "react";

export interface SectionHeaderProps {
  eyebrow: string;
  /** ReactNode so a section can highlight part of its own title. */
  title: ReactNode;
  /** Optional right-hand scroll hint, e.g. ["Scroll", "Stack"]. */
  hint?: readonly [string, string];
  className?: string;
}

export interface AuroraProps {
  /** Motion values driving the parallax drift, when the section supplies them. */
  y?: unknown;
  opacity?: unknown;
}
