"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

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
