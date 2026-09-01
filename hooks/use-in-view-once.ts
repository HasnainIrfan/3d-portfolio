"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * True once the element has come near the viewport, and true forever after.
 *
 * Used to defer the project preview iframes: mounting six cross-origin frames
 * on load is the difference between a smooth scroll and a stalled one, and once
 * a frame has loaded there is no reason to tear it down again.
 */
export const useInViewOnce = <T extends HTMLElement>(
  rootMargin = "200px 0px"
): [RefObject<T | null>, boolean] => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
};
