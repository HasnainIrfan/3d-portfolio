"use client";

import { useEffect, useRef, type RefObject } from "react";
import { type MousePosition } from "@/helpers/particles-helpers";

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
