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
  username: string;
  body: string;
  img: string;
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

export interface CardProps {
  style?: CSSProperties;
  text?: string;
  image?: string;
  containerRef: RefObject<HTMLDivElement | null>;
}

export interface ProjectCardProps extends Project {
  setPreview: (preview: string | null) => void;
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

export interface OrbitingCirclesProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
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
