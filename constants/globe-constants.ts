import { Vector3 } from "three";
import { type GlobeKey, type Orbit, type SectionKey } from "@/types/globe-types";

/** Palette, drawn from the site's own tokens in app/globals.css. */
export const THEME = {
  /** Spikes in shadow — `indigo`. */
  deep: "#1f1e39",
  /** Lit face — between `royal` and `lavender`. */
  base: "#6a3fd6",
  /** Crater colour where an orb presses in — `coral`. */
  hot: "#ea4884",
  /** Secondary tint mixed per spike for variety — `aqua`. */
  spark: "#33c2cc",
  /** Silhouette rim light — `aqua`, cool against the warm core. */
  rim: "#33c2cc",
  /** The dark core sphere the spikes stand on. */
  core: "#08071a",
} as const;

/** Orb colours, in orbit order. */
export const ORB_COLORS = ["#ea4884", "#33c2cc", "#ca2f8c", "#57db96"] as const;

export const GLOBE = {
  sphereRadius: 1.5,
  spikeScale: 0.06,
  /** How far a fully-extended spike pushes past the core. */
  push: 0.52,
  /** Globe radius as a fraction of the smaller viewport dimension. Derived from
   *  the viewport rather than hard-coded so it does not swallow a phone screen.
   *  At 0.3 it was over half the viewport height and competed with the page. */
  fitFraction: 0.2,
  /** Inverse-square strength of an orb's dent. Higher = tighter craters. */
  falloff: 4,
  /** Extra emissive punch on excited spikes, which is what bloom catches. */
  glow: 1.35,
  introDuration: 1.8,

  /** Spring frequency chasing the path, rad/s. ~5 settles in under a second. */
  travelStiffness: 5,

  /** Keyframes assume a landscape viewport with an empty bottom band. A
   *  portrait phone's text runs full width, so the globe is pushed further
   *  below the fold and shrunk there. */
  compactDrop: -0.15,
  compactScale: 0.82,

  /** Constant idle yaw, rad/s — the globe is never completely still. */
  idleSpin: 0.075,
  /** Extra yaw per pixel scrolled; just over half a turn on a typical page. */
  scrollYaw: 0.00006,
  yawStiffness: 3.5,
  /** Fixed lean, so the poles are never square-on to the camera. */
  baseTilt: -0.22,
  /** Deliberately small: a background that lunges at the cursor is a
   *  distraction rather than depth. */
  pointerTiltX: 0.12,
  pointerTiltY: 0.16,

  hoverRadius: 1.45,
  hoverBulge: 0.4,
  hoverSmoothing: 0.22,
  hoverSpin: 0.16,
} as const;

/** World-space radius of a fully-extended spike tip, used to fit the viewport. */
export const GLOBE_OUTER_RADIUS = GLOBE.sphereRadius + GLOBE.push;

export const INSTANCE_COUNT = {
  mobile: 1200,
  tablet: 2200,
  desktop: 3000,
} as const;

export const LIGHT_POSITION = new Vector3(-1, 0.8, 0.25)
  .normalize()
  .multiplyScalar(5);

/**
 * A sphere only projects as a true circle on the camera's optical axis; off-axis
 * it stretches into an ellipse. So the globe never moves — it stays at the
 * origin and the camera shears its *frustum* via `setViewOffset`, the trick a
 * tilt-shift lens uses. That relocates the axis on screen without tilting the
 * image plane, keeping a perfect circle even half off the edge.
 */
export const CAMERA_FOV = 45;
/** Half-height of the visible area at z = 0, preserved from the original lens. */
const CAMERA_VIEW_HALF_HEIGHT = Math.tan((75 / 2) * (Math.PI / 180)) * 5;
export const CAMERA_DISTANCE =
  CAMERA_VIEW_HALF_HEIGHT / Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));

/**
 * The keyframe used at every section boundary, where the globe changes sides.
 * A whole circle in the open middle of the frame looks like a sticker, so the
 * crossing happens *under* the page: only the top of the sphere shows, sliding
 * along the bottom edge like a limb passing behind a horizon.
 */
const DIP = { x: 0, y: -0.66, scale: 1.06, presence: 1 } as const;

/**
 * The path down the page, one keyframe per anchored section, in document order.
 *
 *  - `y` stays low so the globe lives in the bottom band and is always partly
 *    below the fold. 3,000 rods carry detail at roughly the spatial frequency
 *    of text; behind a paragraph that reads as noise, not depth.
 *  - `|x|` near 0.46 puts the centre just inside the edge, so about two-thirds
 *    shows and the rest bleeds off — a shape cut by the frame reads as
 *    continuing past it.
 *  - `x` alternates sign, so the globe drifts corner to corner as you read.
 *  - `scale` is held in a narrow 1.0–1.2 band; a wider range made it pump.
 */
export const SECTION_KEYS: SectionKey[] = [
  // The hero is opaque, so the globe is parked below the fold with no presence
  // and rises into view as the hero scrolls away rather than popping in.
  { id: "home", at: 0.5, x: -0.46, y: -0.58, scale: 1.0, presence: 0 },

  { id: "about", at: 0.5, x: -0.47, y: -0.32, scale: 1.1, presence: 1 },
  { id: "about", at: 1, ...DIP },

  // Services stacks opaque cards; this keyframe exists to carry it right.
  { id: "services", at: 0.5, x: 0.47, y: -0.3, scale: 1.0, presence: 1 },
  { id: "services", at: 1, ...DIP },

  { id: "work", at: 0.5, x: -0.46, y: -0.34, scale: 1.14, presence: 1 },
  { id: "work", at: 1, ...DIP },

  { id: "testimonials", at: 0.5, x: 0.46, y: -0.31, scale: 1.02, presence: 1 },
  { id: "testimonials", at: 1, ...DIP },

  { id: "contact", at: 0.5, x: -0.47, y: -0.33, scale: 1.1, presence: 1 },
];

/** Where it settles at the foot of the page, sinking behind the footer. */
export const TAIL_KEY: GlobeKey = { x: 0.3, y: -0.44, scale: 1.2, presence: 1 };

/**
 * Each orbit is a plane defined by its normal rather than an axis-aligned one —
 * tilted planes read as three-dimensional instead of sliding on rails.
 */
export const ORBITS: readonly Orbit[] = [
  { axis: [0.2, 1, 0.15], speed: 0.95, phase: 2.85, dir: 1, radius: 1.9 },
  { axis: [1, 0.25, -0.4], speed: 0.72, phase: 0.92, dir: -1, radius: 2.0 },
  { axis: [-0.35, 0.5, 1], speed: 0.54, phase: 1.43, dir: 1, radius: 1.85 },
  { axis: [0.7, -0.6, 0.5], speed: 1.18, phase: 1.85, dir: -1, radius: 1.95 },
] as const;
