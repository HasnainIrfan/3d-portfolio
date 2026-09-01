import { Vector3 } from "three";
import { type GlobeKey, type Orbit, type SectionKey } from "@/types/globe-types";

export const THEME = {
  deep: "#1f1e39",
  base: "#6a3fd6",
  hot: "#ea4884",
  spark: "#33c2cc",
  rim: "#33c2cc",
  core: "#08071a",
} as const;

export const ORB_COLORS = ["#ea4884", "#33c2cc", "#ca2f8c", "#57db96"] as const;

export const GLOBE = {
  sphereRadius: 1.5,
  spikeScale: 0.06,
  push: 0.52,
  fitFraction: 0.2,
  falloff: 4,
  glow: 1.35,
  introDuration: 1.8,

  travelStiffness: 5,

  compactDrop: -0.15,
  compactScale: 0.82,

  idleSpin: 0.075,
  scrollYaw: 0.00006,
  yawStiffness: 3.5,
  baseTilt: -0.22,
  pointerTiltX: 0.12,
  pointerTiltY: 0.16,

  hoverRadius: 1.45,
  hoverBulge: 0.4,
  hoverSmoothing: 0.22,
  hoverSpin: 0.16,
} as const;

export const GLOBE_OUTER_RADIUS = GLOBE.sphereRadius + GLOBE.push;

export const INSTANCE_COUNT = {
  mobile: 1200,
  tablet: 2200,
  desktop: 3000,
} as const;

export const LIGHT_POSITION = new Vector3(-1, 0.8, 0.25)
  .normalize()
  .multiplyScalar(5);

export const CAMERA_FOV = 45;
const CAMERA_VIEW_HALF_HEIGHT = Math.tan((75 / 2) * (Math.PI / 180)) * 5;
export const CAMERA_DISTANCE =
  CAMERA_VIEW_HALF_HEIGHT / Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));

const DIP = { x: 0, y: -0.66, scale: 1.06, presence: 1 } as const;

export const SECTION_KEYS: SectionKey[] = [
  { id: "home", at: 0.5, x: -0.46, y: -0.58, scale: 1.0, presence: 0 },

  { id: "about", at: 0.5, x: -0.47, y: -0.32, scale: 1.1, presence: 1 },
  { id: "about", at: 1, ...DIP },

  { id: "services", at: 0.5, x: 0.47, y: -0.3, scale: 1.0, presence: 1 },
  { id: "services", at: 1, ...DIP },

  { id: "work", at: 0.5, x: -0.46, y: -0.34, scale: 1.14, presence: 1 },
  { id: "work", at: 1, ...DIP },

  { id: "testimonials", at: 0.5, x: 0.46, y: -0.31, scale: 1.02, presence: 1 },
  { id: "testimonials", at: 1, ...DIP },

  { id: "contact", at: 0.5, x: -0.47, y: -0.33, scale: 1.1, presence: 1 },
];

export const TAIL_KEY: GlobeKey = { x: 0.3, y: -0.44, scale: 1.2, presence: 1 };

export const ORBITS: readonly Orbit[] = [
  { axis: [0.2, 1, 0.15], speed: 0.95, phase: 2.85, dir: 1, radius: 1.9 },
  { axis: [1, 0.25, -0.4], speed: 0.72, phase: 0.92, dir: -1, radius: 2.0 },
  { axis: [-0.35, 0.5, 1], speed: 0.54, phase: 1.43, dir: 1, radius: 1.85 },
  { axis: [0.7, -0.6, 0.5], speed: 1.18, phase: 1.85, dir: -1, radius: 1.95 },
] as const;
