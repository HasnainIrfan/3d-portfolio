import { type Vector3 } from "three";

/**
 * One keyframe on the globe's path down the page. `x`/`y` are fractions of the
 * visible viewport measured from its centre, so they hold at any aspect ratio;
 * `scale` multiplies `GLOBE.fitFraction`; `presence` fades the globe out by
 * scaling it away (0 hidden, 1 full size).
 */
export interface GlobeKey {
  x: number;
  y: number;
  scale: number;
  presence: number;
}

/** A keyframe bound to a section, reached when `at` passes the viewport centre. */
export interface SectionKey extends GlobeKey {
  id: string;
  /** 0 = the section's top edge, 1 = its bottom edge. */
  at: number;
}

export interface Orbit {
  readonly axis: readonly [number, number, number];
  readonly speed: number;
  readonly phase: number;
  readonly dir: number;
  readonly radius: number;
}

/** Orthonormal basis for the plane an orb orbits in. */
export interface PlaneBasis {
  u: Vector3;
  v: Vector3;
}

export interface GlobeSceneProps {
  count: number;
  paused: boolean;
  /** True on portrait/phone viewports — see `GLOBE.compactDrop`. */
  compact: boolean;
}
