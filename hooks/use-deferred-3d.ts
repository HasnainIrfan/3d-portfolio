"use client";

import { useEffect, useState } from "react";

const MIN_VIEWPORT = 854;
const MIN_CORES = 4;
const MIN_MEMORY_GB = 4;
const IDLE_TIMEOUT_MS = 2000;

/** Highest stage handed out by {@link useDeferred3D}. */
const LAST_STAGE = 1;

/**
 * Renderer names that mean WebGL is being rasterised by the CPU. Driving a
 * full-screen scene through one of these costs seconds of main-thread time per
 * frame, so those visitors get the painted fallback instead.
 */
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

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

let hardwareWebGL: boolean | undefined;

const hasHardwareWebGL = () => {
  if (hardwareWebGL !== undefined) return hardwareWebGL;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");

  if (!gl) {
    hardwareWebGL = false;
    return hardwareWebGL;
  }

  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debug
    ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    : "";

  gl.getExtension("WEBGL_lose_context")?.loseContext();

  // failIfMajorPerformanceCaveat is not usable here: it still hands back a
  // context under SwiftShader while rejecting some genuinely accelerated
  // setups. The renderer name is the reliable signal, and a browser that hides
  // it for fingerprinting reasons is trusted rather than downgraded.
  hardwareWebGL = renderer ? !SOFTWARE_RENDERER.test(renderer) : true;
  return hardwareWebGL;
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

// Every WebGL surface costs a renderer, a context and a round of shader links.
// Mounting them together packs that into one long task, so the stages are
// unlocked one idle callback apart and each scene waits for the thread to go
// quiet again before it claims its share.
let unlocked = -1;
let scheduled = false;
const listeners = new Set<() => void>();

const advance = () => {
  unlocked += 1;
  for (const listener of listeners) listener();
  if (unlocked < LAST_STAGE) whenIdle(advance);
};

const scheduleStages = () => {
  if (scheduled) return;
  scheduled = true;

  const begin = () => whenIdle(advance);

  if (document.readyState === "complete") {
    begin();
  } else {
    window.addEventListener("load", begin, { once: true });
  }
};

const useStagedFlag = (stage: number, test: () => boolean) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(unlocked >= stage && test());

    listeners.add(sync);
    scheduleStages();
    const cancelCatchUp = whenIdle(sync);

    const viewport = window.matchMedia(`(min-width: ${MIN_VIEWPORT}px)`);
    viewport.addEventListener("change", sync);

    return () => {
      listeners.delete(sync);
      cancelCatchUp();
      viewport.removeEventListener("change", sync);
    };
    // `test` is a stable module-level predicate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  return enabled;
};

/**
 * Gates a WebGL scene behind load, an idle main thread, a capable device and a
 * hardware renderer. `stage` orders the scenes: stage 0 mounts first, each
 * later stage waits for another idle callback so their start-up costs never
 * share a task.
 */
export const useDeferred3D = (stage = 0): boolean =>
  useStagedFlag(stage, () => isCapableDevice() && hasHardwareWebGL());

/**
 * Gates the decorative parallax images. They are plain layers moved by
 * composited transforms, so they only need a wide viewport and a device with
 * some headroom - not a GPU that can carry a WebGL scene.
 */
export const useDeferredLayers = (): boolean => useStagedFlag(0, isCapableDevice);
