import { type Project } from "@/types/portfolio-types";

export interface ProjectPanelProps {
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
  showPreview: boolean;
}

export type ProjectSummaryProps = Omit<ProjectPanelProps, "showPreview">;

export type ProjectPreviewProps = Pick<
  ProjectPanelProps,
  "project" | "index" | "total" | "showPreview"
>;

export interface ProjectListProps {
  onOpen: (project: Project) => void;
}
