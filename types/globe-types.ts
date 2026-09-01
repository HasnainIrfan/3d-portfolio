import { type Vector3 } from "three";

export interface GlobeKey {
  x: number;
  y: number;
  scale: number;
  presence: number;
}

export interface SectionKey extends GlobeKey {
  id: string;
  at: number;
}

export interface Orbit {
  readonly axis: readonly [number, number, number];
  readonly speed: number;
  readonly phase: number;
  readonly dir: number;
  readonly radius: number;
}

export interface PlaneBasis {
  u: Vector3;
  v: Vector3;
}

export interface GlobeSceneProps {
  count: number;
  paused: boolean;
  compact: boolean;
}
