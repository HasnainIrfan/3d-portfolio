/** Shared numeric helpers for the 3D scenes and scroll choreography. */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** GLSL-style smoothstep, for proximity falloffs on the CPU side. */
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * Uniform Catmull-Rom. Passes through `p1` at t=0 and `p2` at t=1, taking its
 * tangent from the neighbouring points — which is what makes velocity
 * continuous across keyframes instead of lurching at each one.
 */
export const catmullRom = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (p2 - p0) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (3 * p1 - 3 * p2 + p3 - p0) * t3)
  );
};

export interface Damped {
  value: number;
  velocity: number;
}

/**
 * One step of a critically damped spring: converges as fast as possible without
 * overshooting. Semi-implicit, so it stays stable at any frame time — a plain
 * `value += (target - value) * k` lerp has a velocity discontinuity whenever the
 * target jumps, and that discontinuity is what reads as a lurch.
 */
export const damp = (
  state: Damped,
  target: number,
  omega: number,
  dt: number
): void => {
  const decay = 1 + omega * dt;
  state.velocity =
    (state.velocity - omega * omega * dt * (state.value - target)) /
    (decay * decay);
  state.value += dt * state.velocity;
};
