"use client";

import { type FC } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import {
  MY_PROJECTS,
  PREVIEW_WINDOW,
  TRACK_SPRING,
} from "@/constants/projects-constants";
import { usePinnedProgress } from "@/hooks/use-pinned-progress";
import { type ProjectListProps } from "@/types/project-types";
import { ProjectPanel } from "./project-panel";

/**
 * Desktop layout: a tall track whose sticky inner panel translates a strip of
 * full-screen slides sideways as you scroll past it.
 */
export const PinnedShowcase: FC<ProjectListProps> = ({ onOpen }) => {
  const total = MY_PROJECTS.length;
  const { trackRef, progress, activeIndex } = usePinnedProgress(total);

  const x = useSpring(
    useTransform(progress, [0, 1], ["0vw", `-${(total - 1) * 100}vw`]),
    TRACK_SPRING
  );
  const progressScale = useSpring(progress, TRACK_SPRING);

  return (
    <div
      ref={trackRef}
      style={{ height: `${total * 100}vh` }}
      className="relative mt-10"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-royal/10 blur-[140px]" />
          <div className="absolute bottom-1/3 right-0 h-80 w-80 rounded-full bg-coral/10 blur-[140px]" />
        </div>

        <motion.div style={{ x }} className="flex h-full will-change-transform">
          {MY_PROJECTS.map((project, index) => (
            <ProjectPanel
              key={project.id}
              project={project}
              index={index}
              total={total}
              onOpen={() => onOpen(project)}
              // Only the neighbours keep an iframe mounted; six live
              // cross-origin frames is the difference between a smooth scroll
              // and a stalled one.
              showPreview={Math.abs(index - activeIndex) <= PREVIEW_WINDOW}
            />
          ))}
        </motion.div>

        <motion.div
          style={{ scaleX: progressScale, transformOrigin: "0% 50%" }}
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-coral via-lavender to-royal"
        />
      </div>
    </div>
  );
};
