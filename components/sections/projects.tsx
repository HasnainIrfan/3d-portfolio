"use client";

import { useState, type FC } from "react";
import { useMediaQuery } from "react-responsive";
import { ProjectDetails } from "@/components/portfolio/project-details";
import { PinnedShowcase } from "@/components/projects/pinned-showcase";
import { ProjectsHeader } from "@/components/projects/projects-header";
import { VerticalProjects } from "@/components/projects/vertical-projects";
import { MY_PROJECTS } from "@/constants/portfolio-constants";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { type Project } from "@/types/portfolio-types";

export const Projects: FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 1023 });
  const mounted = useHasMounted();
  const [active, setActive] = useState<Project | null>(null);

  // The pinned layout depends on a viewport measurement the server cannot make,
  // so it only takes over once hydrated.
  const pinned = mounted && !isMobile;

  return (
    <section id="work" className="relative">
      <ProjectsHeader total={MY_PROJECTS.length} />

      {pinned ? (
        <PinnedShowcase onOpen={setActive} />
      ) : (
        <div className="c-space">
          <VerticalProjects onOpen={setActive} />
        </div>
      )}

      {active && (
        <ProjectDetails {...active} closeModal={() => setActive(null)} />
      )}
    </section>
  );
};
