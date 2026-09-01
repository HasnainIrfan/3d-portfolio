"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  Resolution,
  SMAAEffect,
} from "postprocessing";

/** Bloom + SMAA, driving the render loop itself. */
export const useGlobePostprocessing = (dormant: RefObject<boolean>): void => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const composer = useMemo(() => {
    const instance = new EffectComposer(gl, { multisampling: 0 });

    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(new EffectPass(camera, new SMAAEffect()));
    instance.addPass(
      new EffectPass(
        camera,
        // The spike shader ends in a pow(1/2.2) gamma, lifting ordinary lit rods
        // to ~0.8 luminance, so the threshold has to sit very high or bloom
        // catches the whole silhouette and washes it white.
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
  }, [gl, scene, camera]);

  useEffect(() => composer.setSize(size.width, size.height), [composer, size]);
  useEffect(() => () => composer.dispose(), [composer]);

  // Priority > 0 takes rendering over from R3F's default loop. Ascending
  // priority means the scene update at 0 has already run, so `dormant` reflects
  // the state about to be drawn.
  useFrame((_, delta) => {
    // Nothing to draw over the hero, and skipping keeps a full-screen SMAA +
    // bloom pass off the GPU while the astronaut canvas is also running.
    if (dormant.current) return;
    composer.render(delta);
  }, 1);
};
