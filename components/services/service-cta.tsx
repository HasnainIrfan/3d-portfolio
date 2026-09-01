import { type FC } from "react";

export const ServiceCta: FC = () => (
  <a href="#contact" className="group inline-flex items-center gap-4 text-white">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:scale-110">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 -rotate-45"
        aria-hidden
      >
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
      </svg>
    </span>
    <span className="text-base font-medium tracking-tight md:text-lg">
      Start this project
    </span>
  </a>
);
