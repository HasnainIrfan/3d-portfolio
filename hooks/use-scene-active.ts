"use client";

import { useEffect, useState, type RefObject } from "react";

interface SceneActiveOptions {
  /** Also pause while the element is scrolled out of view. */
  whenVisible?: RefObject<Element | null>;
}

/**
 * True while a WebGL scene is worth rendering: the tab is in the foreground
 * and, when an element is given, that element is still on screen. Feeding this
 * to `<Canvas frameloop>` stops a scene from burning frames nobody can see.
 */
export const useSceneActive = ({ whenVisible }: SceneActiveOptions = {}) => {
  const [foreground, setForeground] = useState(true);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const sync = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    const element = whenVisible?.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [whenVisible]);

  return foreground && onScreen;
};
