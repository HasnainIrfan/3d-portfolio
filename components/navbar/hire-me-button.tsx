"use client";

import { type FC, type MouseEvent } from "react";
import { goToAnchor } from "@/helpers/scroll-helpers";
import { type HireMeButtonProps } from "@/types/navigation-types";
import { ArrowIcon } from "./arrow-icon";

export const HireMeButton: FC<HireMeButtonProps> = ({ onClick, full }) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    goToAnchor("#contact");
    onClick?.();
  };

  return (
    <a
      href="#contact"
      onClick={handleClick}
      className={`group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pl-4 pr-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/30 ${
        full ? "w-full justify-between" : ""
      }`}
    >
      <span>Hire Me</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowIcon />
      </span>
    </a>
  );
};
