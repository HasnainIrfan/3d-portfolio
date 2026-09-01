import { type FC } from "react";

export const ArrowIcon: FC<{ className?: string }> = ({
  className = "h-3.5 w-3.5",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`-rotate-45 ${className}`}
    aria-hidden
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);
