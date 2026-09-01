"use client";

import { type FC, type MouseEvent } from "react";
import { motion } from "motion/react";
import { SPRING_SNAPPY } from "@/animations/ui-animations";
import { goToAnchor } from "@/helpers/scroll-helpers";
import { type NavLinkProps } from "@/types/navigation-types";

export const NavLink: FC<NavLinkProps> = ({
  href,
  label,
  active,
  onClick,
}) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      goToAnchor(href);
    }
    onClick?.();
  };

  return (
    <li className="nav-li relative">
      <a
        href={href}
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
        className={`nav-link relative ${active ? "text-white" : ""}`}
      >
        {label}
        {active && (
          <motion.span
            layoutId="active-nav"
            transition={SPRING_SNAPPY}
            className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-6 bg-gradient-to-r from-coral to-lavender"
          />
        )}
      </a>
    </li>
  );
};
