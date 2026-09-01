"use client";

import { useEffect, useState } from "react";
import {
  NAV_ITEMS,
  NAV_OBSERVER_OPTIONS,
} from "@/constants/navigation-constants";

export const useActiveSection = (): string => {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].href);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.href.slice(1))
    ).filter((element): element is HTMLElement => Boolean(element));

    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target.id) setActive(`#${visible.target.id}`);
    }, NAV_OBSERVER_OPTIONS);

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
};
