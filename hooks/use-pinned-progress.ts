"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "motion/react";

/**
 * Drives the pinned horizontal showcase from the page's own scroll position.
 *
 * The track is `total * 100vh` tall and its inner panel is sticky, so scrolling
 * through the track translates the strip sideways. Progress is read from the
 * track's rect rather than from a scroll delta, so it is always absolute — it
 * cannot drift out of sync after a resize or a jump.
 *
 * Reads are batched into one rAF per frame: `getBoundingClientRect` in a raw
 * scroll handler forces a layout flush on every event.
 */
export const usePinnedProgress = (total: number) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useMotionValue(0);

  useEffect(() => {
    let frame: number | null = null;
    let lastIndex = -1;

    const compute = () => {
      const element = trackRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        progress.set(0);
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const ratio = scrolled / scrollable;
      progress.set(ratio);

      const index = Math.min(
        total - 1,
        Math.max(0, Math.round(ratio * (total - 1)))
      );
      if (index !== lastIndex) {
        lastIndex = index;
        setActiveIndex(index);
      }
    };

    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", compute);
    };
  }, [progress, total]);

  return { trackRef, progress, activeIndex };
};
