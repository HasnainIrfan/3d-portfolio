"use client";

import { type FC } from "react";
import { OrbitingCircles } from "@/components/portfolio/orbiting-circles";
import { FRAMEWORK_SKILLS } from "@/constants/portfolio-constants";

const SkillIcon: FC<{ src: string }> = ({ src }) => (
  <img src={src} alt="" className="duration-200 rounded-sm hover:scale-110" />
);

export const Frameworks: FC = () => {
  const reversedSkills = [...FRAMEWORK_SKILLS].reverse();

  return (
    <div className="relative flex h-[15rem] w-full flex-col items-center justify-center">
      <OrbitingCircles iconSize={40}>
        {FRAMEWORK_SKILLS.map((skill) => (
          <SkillIcon key={skill} src={`/assets/logos/${skill}.svg`} />
        ))}
      </OrbitingCircles>
      <OrbitingCircles iconSize={25} radius={100} reverse speed={2}>
        {reversedSkills.map((skill) => (
          <SkillIcon key={`reverse-${skill}`} src={`/assets/logos/${skill}.svg`} />
        ))}
      </OrbitingCircles>
    </div>
  );
};
