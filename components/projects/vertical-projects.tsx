"use client";

import { type FC } from "react";
import { MY_PROJECTS } from "@/constants/portfolio-constants";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import {
  type ProjectListProps,
  type ProjectPanelProps,
} from "@/types/project-types";
import { ProjectPanel } from "./project-panel";

/** Mounts its preview only once the panel nears the viewport. */
const LazyPanel: FC<Omit<ProjectPanelProps, "showPreview">> = (props) => {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref}>
      <ProjectPanel {...props} showPreview={inView} />
    </div>
  );
};

/** Mobile and tablet layout: the same panels, stacked. */
export const VerticalProjects: FC<ProjectListProps> = ({ onOpen }) => (
  <div className="mt-12 space-y-20">
    {MY_PROJECTS.map((project, index) => (
      <LazyPanel
        key={project.id}
        project={project}
        index={index}
        total={MY_PROJECTS.length}
        onOpen={() => onOpen(project)}
      />
    ))}
  </div>
);
