"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Pointer position in normalised device coordinates: -1 to 1 on each axis, with
 * the origin at the centre of the viewport and +Y upward.
 *
 * Tracked on `window` rather than on an element, because the canvas that uses
 * this sits behind the page with `pointer-events: none` and never receives
 * events of its own.
 */
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
