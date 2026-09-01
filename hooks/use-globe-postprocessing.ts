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

  useFrame((_, delta) => {
    if (dormant.current) return;
    composer.render(delta);
  }, 1);
};
