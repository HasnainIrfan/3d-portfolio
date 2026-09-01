"use client";

import { type FC, type MouseEvent } from "react";
import { HERO_NAME } from "@/constants/hero-constants";
import { goToAnchor } from "@/helpers/scroll-helpers";

export const NavBrand: FC = () => (
  <a
    href="#home"
    onClick={(event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      goToAnchor("#home");
    }}
    className="group flex items-center gap-2 text-base font-semibold tracking-tight text-white"
  >
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-royal to-coral text-sm font-black text-white shadow-lg shadow-coral/20 transition-transform group-hover:scale-105">
      {HERO_NAME.charAt(0)}
    </span>
    <span className="hidden sm:inline">{HERO_NAME}</span>
  </a>
);
