import { type FC } from "react";
import { type ProjectPanelProps } from "@/types/project-types";
import { ProjectPreview } from "./project-preview";
import { ProjectSummary } from "./project-summary";

/** One full-viewport project slide, shared by the pinned and vertical layouts. */
export const ProjectPanel: FC<ProjectPanelProps> = ({
  project,
  index,
  total,
  onOpen,
  showPreview,
}) => (
  <div className="flex h-screen w-screen shrink-0 items-center justify-center px-6 md:px-20">
    <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <ProjectSummary
        project={project}
        index={index}
        total={total}
        onOpen={onOpen}
      />
      <ProjectPreview
        project={project}
        index={index}
        total={total}
        showPreview={showPreview}
      />
    </div>
  </div>
);
