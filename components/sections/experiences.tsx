"use client";

import { type FC } from "react";
import { Timeline } from "@/components/portfolio/timeline";
import { EXPERIENCES } from "@/constants/portfolio-constants";

export const Experiences: FC = () => (
  <div className="w-full">
    <Timeline data={EXPERIENCES} />
  </div>
);
