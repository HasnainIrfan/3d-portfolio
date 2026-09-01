"use client";

import { useEffect, useRef, type RefObject } from "react";

export const useNormalizedPointer = (): RefObject<{ x: number; y: number }> => {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return pointer;
};
