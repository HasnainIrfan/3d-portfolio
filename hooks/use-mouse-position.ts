"use client";

import { useEffect, useRef, type RefObject } from "react";
import { type MousePosition } from "@/helpers/particles-helpers";

/**
 * Pointer position in a ref rather than state.
 *
 * Deliberate: a pointer that updates state re-renders the whole subtree on
 * every mouse move. Consumers here read the value inside an animation frame,
 * where a ref is exactly right.
 */
export const useMousePosition = (): RefObject<MousePosition> => {
  const position = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      position.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return position;
};
