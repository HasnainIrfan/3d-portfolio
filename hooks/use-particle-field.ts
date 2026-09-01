"use client";

import { useEffect, useRef } from "react";
import {
  ALPHA_STEP,
  DRIFT,
  EDGE_FADE_DISTANCE,
  MAGNETISM,
  RESIZE_DEBOUNCE,
  TARGET_ALPHA,
} from "@/constants/particles-constants";
import {
  hexToRgb,
  remapValue,
  type ParticleCircle,
} from "@/helpers/particles-helpers";
import { useMousePosition } from "./use-mouse-position";

export interface ParticleFieldOptions {
  quantity: number;
  staticity: number;
  ease: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  refresh: boolean;
}

export const useParticleField = ({
  quantity,
  staticity,
  ease,
  size,
  color,
  vx,
  vy,
  refresh,
}: ParticleFieldOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<ParticleCircle[]>([]);
  const canvasSize = useRef({ w: 0, h: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const frameId = useRef<number | null>(null);
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointer = useMousePosition();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    contextRef.current = canvas.getContext("2d");
    const context = contextRef.current;
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const rgb = hexToRgb(color);

    const createCircle = (): ParticleCircle => ({
      x: Math.floor(Math.random() * canvasSize.current.w),
      y: Math.floor(Math.random() * canvasSize.current.h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: parseFloat(
        (Math.random() * TARGET_ALPHA.range + TARGET_ALPHA.min).toFixed(1)
      ),
      dx: (Math.random() - 0.5) * DRIFT,
      dy: (Math.random() - 0.5) * DRIFT,
      magnetism: MAGNETISM.min + Math.random() * MAGNETISM.range,
    });

    const drawCircle = (circle: ParticleCircle, existing = false) => {
      context.translate(circle.translateX, circle.translateY);
      context.beginPath();
      context.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
      context.fillStyle = `rgba(${rgb.join(", ")}, ${circle.alpha})`;
      context.fill();
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!existing) circles.current.push(circle);
    };

    const resize = () => {
      canvasSize.current.w = container.offsetWidth;
      canvasSize.current.h = container.offsetHeight;
      canvas.width = canvasSize.current.w * dpr;
      canvas.height = canvasSize.current.h * dpr;
      canvas.style.width = `${canvasSize.current.w}px`;
      canvas.style.height = `${canvasSize.current.h}px`;
      context.scale(dpr, dpr);

      circles.current = [];
      for (let i = 0; i < quantity; i++) drawCircle(createCircle());
    };

    const trackPointer = () => {
      const rect = canvas.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = pointer.current.x - rect.left - w / 2;
      const y = pointer.current.y - rect.top - h / 2;
      if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    };

    const animate = () => {
      trackPointer();
      context.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      circles.current.forEach((circle, index) => {
        const edges = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ];
        const nearestEdge = Math.min(...edges);
        const edgeFade = parseFloat(
          remapValue(nearestEdge, 0, EDGE_FADE_DISTANCE, 0, 1).toFixed(2)
        );

        if (edgeFade > 1) {
          circle.alpha = Math.min(circle.alpha + ALPHA_STEP, circle.targetAlpha);
        } else {
          circle.alpha = circle.targetAlpha * edgeFade;
        }

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) -
            circle.translateX) /
          ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) -
            circle.translateY) /
          ease;

        drawCircle(circle, true);

        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(index, 1);
          drawCircle(createCircle());
        }
      });

      frameId.current = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(resize, RESIZE_DEBOUNCE);
    };

    resize();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      if (frameId.current !== null) cancelAnimationFrame(frameId.current);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [color, ease, pointer, quantity, refresh, size, staticity, vx, vy]);

  return { containerRef, canvasRef };
};
