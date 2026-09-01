import { type ReactNode } from "react";

export interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  hint?: readonly [string, string];
  className?: string;
}

export interface AuroraProps {
  y?: unknown;
  opacity?: unknown;
}
