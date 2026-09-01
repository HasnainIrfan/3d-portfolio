import { type CSSProperties, type HTMLAttributes, type RefObject } from "react";

export interface ProjectTag {
  id: number;
  name: string;
  path: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  subDescription: string[];
  href: string;
  logo: string;
  image: string;
  tags: ProjectTag[];
  accent: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface Experience {
  title: string;
  job: string;
  date: string;
  contents: string[];
}

export interface Review {
  name: string;
  role: string;
  body: string;
  accent: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  bullets: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProjectDetailsProps extends Project {
  closeModal: () => void;
}

export interface AlertProps {
  type: "success" | "danger";
  text: string;
}

export interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export interface ParticlesProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

export interface TimelineProps {
  data: Experience[];
}

export interface AstronautProps {
  scale?: number;
  position?: [number, number, number];
}

export interface ThemedGlobeProps {
  className?: string;
}
