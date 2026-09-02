"use client";

import { useEffect, useState } from "react";

const MIN_VIEWPORT = 854;
const MIN_CORES = 4;
const MIN_MEMORY_GB = 4;
const IDLE_TIMEOUT_MS = 2000;

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

const isCapableDevice = () => {
  if (typeof window === "undefined") return false;

  const viewport = window.matchMedia(`(min-width: ${MIN_VIEWPORT}px)`);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!viewport.matches || reducedMotion.matches) return false;

  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? MIN_CORES;
  const memory = nav.deviceMemory ?? MIN_MEMORY_GB;

  return cores >= MIN_CORES && memory >= MIN_MEMORY_GB;
};

const whenIdle = (run: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(run, {
      timeout: IDLE_TIMEOUT_MS,
    });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = window.setTimeout(run, 200);
  return () => window.clearTimeout(handle);
};

export const useDeferred3D = (): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelIdle: (() => void) | undefined;

    const start = () => {
      cancelIdle = whenIdle(() => setEnabled(isCapableDevice()));
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    const viewport = window.matchMedia(`(min-width: ${MIN_VIEWPORT}px)`);
    const onViewportChange = () => setEnabled(isCapableDevice());
    viewport.addEventListener("change", onViewportChange);

    return () => {
      cancelIdle?.();
      window.removeEventListener("load", start);
      viewport.removeEventListener("change", onViewportChange);
    };
  }, []);

  return enabled;
};
