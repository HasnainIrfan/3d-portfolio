"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  Resolution,
} from "postprocessing";

// Edge smoothing comes from the render target's MSAA rather than an SMAA pass.
// SMAAEffect decodes two lookup textures and links three extra programs while
// it is constructed, which cost ~600ms of main-thread time on a mid-range CPU;
// multisampling hands the same job to the GPU for nothing on the main thread.
const MULTISAMPLING = 4;
const IDLE_TIMEOUT_MS = 2000;

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

export const useGlobePostprocessing = (dormant: RefObject<boolean>): void => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  // Building the passes links their shader programs. Waiting one more idle
  // callback keeps that off the task that creates the context and compiles the
  // globe's own materials; the first few frames render unbloomed instead.
  const [ready, setReady] = useState(false);
  useEffect(() => whenIdle(() => setReady(true)), []);

  const composer = useMemo(() => {
    if (!ready) return null;

    const instance = new EffectComposer(gl, {
      multisampling: MULTISAMPLING,
    });

    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(
      new EffectPass(
        camera,
        new BloomEffect({
          mipmapBlur: true,
          luminanceThreshold: 0.95,
          luminanceSmoothing: 0.03,
          intensity: 0.9,
          kernelSize: KernelSize.MEDIUM,
          resolutionScale: 0.5,
          resolutionX: Resolution.AUTO_SIZE,
          resolutionY: Resolution.AUTO_SIZE,
        })
      )
    );
    return instance;
  }, [ready, gl, scene, camera]);

  useEffect(() => composer?.setSize(size.width, size.height), [composer, size]);
  useEffect(() => () => composer?.dispose(), [composer]);

  // Priority 1 hands the render loop over from react-three-fiber, so this has
  // to draw the plain scene for as long as the composer is still pending.
  useFrame((_, delta) => {
    if (dormant.current) return;
    if (composer) composer.render(delta);
    else gl.render(scene, camera);
  }, 1);
};
