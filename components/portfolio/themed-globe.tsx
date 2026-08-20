"use client";

/**
 * Themed globe — a single-file port of the multi-file R3F demo in `globe/src`.
 *
 * The mechanic that makes it work: 3,000 capsules are instanced onto a
 * Fibonacci sphere, each rotated so its flat end faces outward, giving a dense
 * "fur ball". Four orbs orbit the sphere on tilted planes, and every spike
 * measures its inverse-square distance to each orb — the nearest orb presses
 * that spike back toward the core, so the orbs carve travelling craters into
 * the surface. Everything is computed in the vertex shader, so the whole globe
 * is a single instanced draw call.
 *
 * Differences from the original demo, all deliberate:
 *  - Retheming from studio grey to the site palette (royal → lavender, with
 *    coral/aqua hot spots where the orbs excite the surface, and an aqua rim
 *    light that separates the silhouette from the near-black page).
 *  - The original loaded `/bnoise.png` and `/glass.png`. Neither asset exists
 *    in this project, so the matcap is replaced by analytic fresnel/spec glass
 *    and the noise lookup is gone entirely — two fewer texture fetches.
 *  - The orbs no longer refract a blurred copy of the scene. That effect only
 *    reads against the demo's light grey backdrop; over this site's near-black
 *    it is invisible, so the render target, the Kawase blur pass and the
 *    `onAfterRender` plumbing are all gone. The orbs are lit as energy cores
 *    instead and rely on bloom to bleed.
 *  - No shadow map. The demo's `lights: true` + `customDepthMaterial` setup
 *    throws inside postprocessing's composer on three r184 (it uploads an empty
 *    `directionalLightShadows` array), and it only ever bought spike-on-spike
 *    self-shadowing since the orbs never cast. A smoothstep on N·L reproduces
 *    that terminator without a second pass over 3,000 instances, and it can
 *    never desync from the displaced geometry.
 *  - The grey studio floor is dropped; it does not belong in a dark space scene.
 *  - Hold-to-destroy is gone. It armed on any `pointerdown` anywhere in the
 *    window while the globe was near the cursor, so now that the globe sits
 *    behind the page, clicking a card that happened to overlap it blew the
 *    globe apart — an effect with no discoverable cause. The shader, uniforms
 *    and listeners for it are all removed rather than left dormant.
 *
 * How it moves down the page: one keyframe per section, reached when that
 * section is centred, joined by a Catmull-Rom spline and chased by critically
 * damped springs. `useGlobePath` and the `damp` helper below carry the detail,
 * including what this replaced and why.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type FC,
  type RefObject,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type RootState,
} from "@react-three/fiber";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  Resolution,
  SMAAEffect,
} from "postprocessing";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { twMerge } from "tailwind-merge";
import {
  BufferGeometry,
  CapsuleGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type PerspectiveCamera,
  type ShaderMaterial,
} from "three";
import { type ThemedGlobeProps } from "@/types/portfolio-types";

/* -------------------------------------------------------------------------- */
/*  Theme + tuning                                                            */
/* -------------------------------------------------------------------------- */

const THEME = {
  /** Spikes sitting in shadow — the site's `indigo`. */
  deep: "#1f1e39",
  /** Lit face of the spikes — between `royal` and `lavender`. */
  base: "#6a3fd6",
  /** Hot crater colour where an orb presses in — `coral`. */
  hot: "#ea4884",
  /** Secondary hot tint, mixed per-spike for variety — `aqua`. */
  spark: "#33c2cc",
  /** Silhouette rim light — `aqua`, which reads as cool against the warm core. */
  rim: "#33c2cc",
  /** The dark core sphere the spikes stand on. */
  core: "#08071a",
} as const;

/** Orb colours, in orbit order. */
const ORB_COLORS = ["#ea4884", "#33c2cc", "#ca2f8c", "#57db96"] as const;

const GLOBE = {
  /** Radius the spikes are seeded onto. */
  sphereRadius: 1.5,
  /** Per-capsule scale. */
  spikeScale: 0.06,
  /** How far a fully-extended spike pushes out past the core. */
  push: 0.52,
  /** Target globe radius as a fraction of the SMALLER visible viewport
   *  dimension. Deriving the scale from the viewport instead of hard-coding it
   *  is what keeps the globe from swallowing a narrow phone screen, where the
   *  world-space width is a third of the desktop's.
   *
   *  0.2 puts the sphere at roughly 400px across on a laptop — an accent. At
   *  the 0.3 this started from it was ~670px, more than half the viewport
   *  height, and a shape that size stops reading as background and starts
   *  competing with the page for attention. */
  fitFraction: 0.2,
  /** Inverse-square strength of an orb's dent. Higher = tighter craters. */
  falloff: 4,
  /** Extra emissive punch on excited spikes, which is what bloom catches. */
  glow: 1.35,
  /** Seconds for the intro scale-up. */
  introDuration: 1.8,

  /* -- Travel ------------------------------------------------------------- */
  /** Natural frequency, in rad/s, of the critically damped spring that chases
   *  the path. ~5 settles in a little under a second: slow enough to read as
   *  drifting mass, fast enough that it is never lagging behind the section
   *  you are actually looking at. */
  travelStiffness: 5,

  /* -- Compact viewports -------------------------------------------------- */
  /** The keyframes are authored against a landscape viewport, where the bottom
   *  band of a section is reliably empty. A portrait phone breaks that
   *  assumption: the text column runs the full width and most of the way down
   *  the screen, so the same fractional `y` leaves the globe sitting under the
   *  body copy. These push it further below the fold and shrink it there. */
  compactDrop: -0.15,
  compactScale: 0.82,

  /* -- Rotation ----------------------------------------------------------- */
  /** Constant idle yaw in rad/s. The globe is never completely still. */
  idleSpin: 0.075,
  /** Radians of extra yaw per pixel scrolled. Multiplied by a typical 8–12k px
   *  page this is a little over half a turn top to bottom — enough that
   *  scrolling clearly turns the globe, far short of the full spin (and the
   *  whip on every flick) the previous momentum-driven version produced. */
  scrollYaw: 0.00006,
  /** Natural frequency of the spring that chases the scroll-derived yaw. */
  yawStiffness: 3.5,
  /** Fixed lean, so the poles are never square-on to the camera. */
  baseTilt: -0.22,
  /** How far the pointer may tilt the globe, in radians. Deliberately small:
   *  this is a background, and a background that lunges at the cursor reads as
   *  a distraction rather than as depth. */
  pointerTiltX: 0.12,
  pointerTiltY: 0.16,

  /* -- Hover -------------------------------------------------------------- */
  /** Local-space reach of the cursor's bulge. */
  hoverRadius: 1.45,
  /** How far spikes under the cursor reach toward the viewer. */
  hoverBulge: 0.4,
  /** Seconds for hover strength to ease in/out. */
  hoverSmoothing: 0.22,
  /** Extra spin while hovered, in radians per second. */
  hoverSpin: 0.16,
} as const;

/**
 * One keyframe on the globe's path down the page. `x`/`y` are fractions of the
 * visible viewport measured from its centre, so they hold at any aspect ratio;
 * `scale` multiplies `fitFraction`; `presence` fades the globe out by scaling
 * it away (0 hidden, 1 full size).
 *
 * A keyframe is reached exactly when its section is centred in the viewport,
 * and the path between keyframes is a Catmull-Rom spline — see `useGlobePath`.
 */
interface GlobeKey {
  x: number;
  y: number;
  scale: number;
  presence: number;
}

/**
 * The path itself, one keyframe per anchored section, in document order.
 *
 * Three rules shape these numbers:
 *
 *  - `y` stays low, around -0.3 to -0.45, so the globe lives in the bottom band
 *    of the viewport and is always partly below the fold. This is the rule that
 *    matters most. The sphere's surface is 3,000 rods, so it carries detail at
 *    roughly the spatial frequency of text — laid behind a paragraph it does
 *    not read as depth, it reads as noise, and the paragraph becomes hard work.
 *    The bottom band is the one part of a section that is reliably empty.
 *  - `|x|` stays near 0.46, putting the centre just inside the viewport edge so
 *    about two-thirds of the sphere shows and the rest bleeds off. A shape cut
 *    by the frame reads as continuing past it; a whole circle floating in the
 *    middle reads as a sticker.
 *  - `x` alternates sign, so the globe slides slowly along the bottom from one
 *    corner to the other as you read down. Every section is at least a viewport
 *    tall, so a crossing takes ~1000px of scroll — a drift, not a sweep — and
 *    it happens down where there is nothing to obscure.
 *
 * `scale` is held in a narrow 1.0–1.2 band. The 0.5–1.4 range this started from
 * made the globe visibly pump in size between sections, which is most of what
 * read as jumpy.
 */
/**
 * The keyframe used at every section boundary, where the globe changes sides.
 *
 * A crossing is the one moment the path cannot keep the globe against an edge,
 * and a whole circle sitting in the open middle of the frame looks like a
 * sticker rather than like part of the scene. So the crossing happens *under*
 * the page: `y` of -0.66 drops the centre below the viewport floor, leaving
 * only the top of the sphere showing, and it slides along the bottom edge like
 * a limb passing behind a horizon before rising again on the other side.
 */
const DIP = { x: 0, y: -0.66, scale: 1.06, presence: 1 } as const;

const SECTION_KEYS: (GlobeKey & {
  /** Which section this keyframe hangs off. */
  id: string;
  /** Where in that section, 0 = its top edge, 1 = its bottom edge. The keyframe
   *  is reached when that point passes the centre of the viewport. */
  at: number;
})[] = [
  // The hero is opaque — sky, mountains and the astronaut own it — so the globe
  // is parked below the fold with no presence and simply rises into view as the
  // hero scrolls away, rather than popping in.
  { id: "home", at: 0.5, x: -0.46, y: -0.58, scale: 1.0, presence: 0 },

  { id: "about", at: 0.5, x: -0.47, y: -0.32, scale: 1.1, presence: 1 },
  { id: "about", at: 1, ...DIP },
  // Services stacks opaque full-bleed cards, so the globe is almost entirely
  // hidden here regardless; the keyframe exists to carry it across to the right.
  { id: "services", at: 0.5, x: 0.47, y: -0.3, scale: 1.0, presence: 1 },
  { id: "services", at: 1, ...DIP },

  { id: "work", at: 0.5, x: -0.46, y: -0.34, scale: 1.14, presence: 1 },
  { id: "work", at: 1, ...DIP },

  { id: "testimonials", at: 0.5, x: 0.46, y: -0.31, scale: 1.02, presence: 1 },
  { id: "testimonials", at: 1, ...DIP },

  { id: "contact", at: 0.5, x: -0.47, y: -0.33, scale: 1.1, presence: 1 },
];

/** Where it settles at the foot of the page — drifting in off the right and
 *  sinking behind the footer. */
const TAIL_KEY: GlobeKey = {
  x: 0.3,
  y: -0.44,
  scale: 1.2,
  presence: 1,
};

/**
 * Each orbit is a plane defined by its normal, rather than the demo's
 * axis-aligned 'xy' / 'xz' / 'yz' planes — tilted planes read as genuinely
 * three-dimensional instead of looking like they are sliding on rails.
 */
const ORBITS = [
  { axis: [0.2, 1, 0.15], speed: 0.95, phase: 2.85, dir: 1, radius: 1.9 },
  { axis: [1, 0.25, -0.4], speed: 0.72, phase: 0.92, dir: -1, radius: 2.0 },
  { axis: [-0.35, 0.5, 1], speed: 0.54, phase: 1.43, dir: 1, radius: 1.85 },
  { axis: [0.7, -0.6, 0.5], speed: 1.18, phase: 1.85, dir: -1, radius: 1.95 },
] as const;

/** World-space radius of a fully-extended spike tip, used to fit the globe to
 *  the viewport. */
const GLOBE_OUTER_RADIUS = GLOBE.sphereRadius + GLOBE.push;

const INSTANCE_COUNT = { mobile: 1200, tablet: 2200, desktop: 3000 } as const;

const LIGHT_POSITION = new Vector3(-1, 0.8, 0.25).normalize().multiplyScalar(5);

/**
 * A sphere is only projected as a true circle when it sits on the camera's
 * optical axis; off-axis it projects as an ellipse stretched by roughly
 * 1/cos(angle). Moving the globe sideways in world space is what egged it.
 *
 * So the globe never moves: it stays at the origin, on the axis, and the camera
 * shifts its *frustum* instead via `setViewOffset` — the same trick a tilt-shift
 * lens uses. Shearing the frustum relocates where the axis lands on screen
 * without tilting the image plane, so the silhouette cone still meets the plane
 * in a circle. The result is a perfect circle at any position, including half
 * off the edge, which a narrow lens alone could never guarantee.
 */
const CAMERA_FOV = 45;
/** Half-height of the visible area at z = 0, preserved from the original lens. */
const CAMERA_VIEW_HALF_HEIGHT = Math.tan((75 / 2) * (Math.PI / 180)) * 5;
const CAMERA_DISTANCE =
  CAMERA_VIEW_HALF_HEIGHT / Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));

/* -------------------------------------------------------------------------- */
/*  Shared GLSL                                                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Spike shaders                                                             */
/* -------------------------------------------------------------------------- */

const spikeVertexShader = /* glsl */ `
attribute vec3 a_instancePos;
attribute vec4 a_instanceQuat;
attribute float a_instanceRand;

uniform float u_scale;
uniform float u_breath;
uniform float u_push;
uniform float u_falloff;
uniform vec3 u_orbs[4];

uniform vec3 u_cursor;
uniform float u_hover;
uniform float u_hoverRadius;
uniform float u_hoverBulge;

varying vec3 v_worldPos;
varying vec3 v_instancePos;
varying vec3 v_worldNormal;
varying vec3 v_modelPos;
varying float v_energy;
varying float v_rand;
varying float v_bulge;

vec3 gRotateByQuat(vec3 v, vec4 q) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

/** 0 when the orb is on top of this spike, 1 when it is far away. */
float gOrbFalloff(vec3 p, vec3 orb) {
  float d = length(p - orb);
  return 1.0 - clamp(1.0 / (u_falloff * d * d), 0.0, 1.0);
}

void main() {
  vec3 basePos = a_instancePos * u_breath;

  float dent = 1.0;
  for (int i = 0; i < 4; i++) {
    dent = min(dent, gOrbFalloff(basePos, u_orbs[i]));
  }

  // Cursor bulge: the inverse of an orb. Where an orb presses spikes in, the
  // pointer pulls the ones under it out toward the viewer.
  float cursorDist = length(basePos - u_cursor);
  float bulge = u_hover * (1.0 - smoothstep(0.0, u_hoverRadius, cursorDist));
  bulge *= bulge;

  vec3 pos = position;
  vec3 norm = normal;

  // Flatten the outward cap so the spikes read as cut rods, not pills.
  if (1.0 - step(-2.5, pos.y) > 0.5) {
    pos.y = -2.5;
    norm = vec3(0.0, -1.0, 0.0);
  }

  pos = gRotateByQuat(pos, a_instanceQuat);
  pos *= u_scale;
  pos += basePos;
  pos += normalize(basePos) * (u_push * pow(dent, 0.7) + bulge * u_hoverBulge);

  norm = gRotateByQuat(norm, a_instanceQuat);

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;

  v_worldPos = worldPosition.xyz;
  v_instancePos = basePos;
  v_modelPos = position;
  v_rand = a_instanceRand;
  v_energy = 1.0 - dent;
  v_bulge = bulge;
  v_worldNormal = normalize(mat3(modelMatrix) * norm);
}
`;

const spikeFragmentShader = /* glsl */ `
varying vec3 v_worldPos;
varying vec3 v_instancePos;
varying vec3 v_worldNormal;
varying vec3 v_modelPos;
varying float v_energy;
varying float v_rand;
varying float v_bulge;

uniform vec3 u_lightPosition;
uniform vec3 u_colorDeep;
uniform vec3 u_colorBase;
uniform vec3 u_colorHot;
uniform vec3 u_colorSpark;
uniform vec3 u_colorRim;
uniform float u_glow;

float gLinearStep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {
  // Shade against the spike's radial direction rather than its true normal —
  // that is what keeps the ball reading as one volume instead of 3,000 rods.
  vec3 N = normalize(normalize(v_instancePos) + 0.2 * normalize(v_worldNormal));
  vec3 V = normalize(cameraPosition - v_worldPos);
  vec3 L = normalize(u_lightPosition - v_instancePos);
  float NdL = max(0.0, dot(N, L));

  // Darken toward the buried end of each capsule for contact occlusion.
  float ao = gLinearStep(-0.5, -3.0, v_modelPos.y);

  // Analytic stand-in for the demo's shadow map. Spikes only see the key light
  // once their radial direction clears the terminator, and neighbours occlude
  // each other at grazing angles — a smoothstep on NdL reproduces that soft
  // falloff closely enough at a fraction of a full shadow pass over 3,000
  // instances, and it cannot desync from the displaced geometry.
  // A lower ambient floor than the demo's 0.24. Against a near-black page the
  // unlit side wants to fall away into the background, and the extra range is
  // what stops the sphere reading as one flat chalky mass.
  float shadow = 0.15 + 0.85 * smoothstep(-0.3, 0.6, NdL);

  vec3 cool = mix(u_colorDeep, u_colorBase, smoothstep(-0.15, 1.0, NdL));
  // Weighted toward coral rather than an even coral/aqua split. An even mix
  // sends half the spikes cyan, and with the widened threshold below that was
  // enough to turn the whole sphere cyan — the site's accent is coral, with
  // aqua only as a secondary spark and the rim light.
  vec3 hot = mix(u_colorHot, u_colorSpark, v_rand * 0.45);
  // Widened from smoothstep(0.25, 0.95): the orbs only ever drive v_energy
  // above 0.25 across a small cap, so at the old thresholds the accent colours
  // barely appeared and the globe sat on the violet alone, which is what made
  // it read as grey-lavender rather than as the site's palette. Not opened up
  // any further than this — violet is the base, the orbs are the accent.
  vec3 color = mix(cool, hot, smoothstep(0.16, 0.8, v_energy));

  color *= ao * ao;
  color *= shadow;

  // Cool rim light along the silhouette — this is what separates the globe
  // from the near-black page behind it without needing a brighter key light.
  // Violet-led, with only a touch of aqua at the very edge.
  //
  // The rim carries more weight here than in the demo it came from. The globe
  // is parked low and half off the side of the viewport, so the part on screen
  // is mostly the sphere's limb — and the limb is exactly where the rim term
  // peaks. An aqua-dominant rim therefore did not read as "cool edge light on
  // a violet ball", it read as a cyan ball, because the violet body was
  // off-screen. Leading with the base colour puts the globe back on the site's
  // palette while the aqua still separates the silhouette from the near-black
  // page, which is the job the rim is actually there to do.
  float rim = pow(1.0 - max(0.0, dot(N, V)), 3.4);
  color += mix(u_colorBase, u_colorRim, 0.3) * rim * 0.55 * ao;

  vec3 H = normalize(V + L);
  float sheen = pow(max(0.0, dot(N, H)), 22.0);
  color += vec3(1.0) * sheen * 0.16 * ao;

  // Push excited craters above 1.0 so the bloom pass has something to bleed.
  color += hot * smoothstep(0.42, 0.92, v_energy) * ao * u_glow;

  // Spikes reaching toward the cursor light up, so the hover reads as the
  // globe responding rather than merely deforming.
  color += mix(u_colorRim, u_colorHot, v_rand) * v_bulge * 1.1;

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}
`;

/* -------------------------------------------------------------------------- */
/*  Orb shaders — analytic glass, no matcap texture                           */
/* -------------------------------------------------------------------------- */

const orbVertexShader = /* glsl */ `
varying vec3 v_worldPos;
varying vec3 v_worldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  v_worldPos = worldPosition.xyz;
  v_worldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const orbFragmentShader = /* glsl */ `
varying vec3 v_worldPos;
varying vec3 v_worldNormal;

uniform vec3 u_color;
uniform vec3 u_lightPosition;
uniform float u_intensity;

void main() {
  vec3 N = normalize(v_worldNormal);
  vec3 V = normalize(cameraPosition - v_worldPos);
  vec3 L = normalize(u_lightPosition - v_worldPos);
  vec3 H = normalize(V + L);

  float NdV = max(0.0, dot(N, V));
  float NdL = max(0.0, dot(N, L));
  float fresnel = pow(1.0 - NdV, 3.0);
  float spec = pow(max(0.0, dot(H, N)), 220.0);

  vec3 color = u_color * (0.35 + 0.65 * NdL);
  color += u_color * pow(NdV, 1.6) * 1.4;                    // glowing core
  color += mix(u_color, vec3(1.0), 0.65) * fresnel * 1.8;    // bright rim
  color += vec3(1.0) * spec * 0.9;                           // highlight
  color *= u_intensity;

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}
`;

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fibonacci-sphere placement: the golden angle spreads points far more evenly
 * over a sphere than latitude/longitude, which would bunch them at the poles.
 * Each instance also carries the quaternion that aims its capsule outward.
 */
const createSpikeGeometry = (count: number, radius: number): BufferGeometry => {
  const reference = new CapsuleGeometry(1, 4, 4, 16);
  const geometry = new InstancedBufferGeometry();

  for (const id in reference.attributes) {
    geometry.setAttribute(id, reference.attributes[id]);
  }
  geometry.setIndex(reference.index);

  const positions = new Float32Array(count * 3);
  const quaternions = new Float32Array(count * 4);
  const randoms = new Float32Array(count);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const up = new Vector3(0, 1, 0);
  const direction = new Vector3();
  const quaternion = new Quaternion();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * ring * radius;
    const z = Math.sin(theta) * ring * radius;
    const posY = y * radius;

    positions[i3] = x;
    positions[i3 + 1] = posY;
    positions[i3 + 2] = z;

    // Aim the capsule's +Y at the core, so its flat cut end faces outward.
    direction.set(-x, -posY, -z).normalize();
    quaternion.setFromUnitVectors(up, direction);
    quaternions[i4] = quaternion.x;
    quaternions[i4 + 1] = quaternion.y;
    quaternions[i4 + 2] = quaternion.z;
    quaternions[i4 + 3] = quaternion.w;

    // Deterministic per-spike variation for the hot-colour mix.
    randoms[i] = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
  }

  geometry.setAttribute("a_instancePos", new InstancedBufferAttribute(positions, 3));
  geometry.setAttribute("a_instanceQuat", new InstancedBufferAttribute(quaternions, 4));
  geometry.setAttribute("a_instanceRand", new InstancedBufferAttribute(randoms, 1));

  reference.dispose();
  return geometry;
};

/** GLSL-style smoothstep, for the pointer proximity falloff. */
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Uniform Catmull-Rom. Passes exactly through `p1` at t=0 and `p2` at t=1, and
 * takes its tangent at each from the neighbouring keyframes — which is what
 * makes velocity continuous *across* keyframes, so the globe glides through
 * each section instead of arriving, stopping, and lurching off again.
 */
const catmullRom = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
) => {
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

/**
 * Resolves the globe's target position from the scroll offset.
 *
 * Each anchored section contributes one keyframe placed at the scroll offset
 * where that section is centred in the viewport, plus a tail keyframe at the
 * foot of the document. Between two keyframes the path is a Catmull-Rom spline
 * evaluated on the fraction of the way from one to the next.
 *
 * This replaces a per-section scheme that held one slot for the first 55% of a
 * section and then blended to the next over the remaining 45%. That produced
 * exactly the motion it sounds like: the globe sat still, then darted, then sat
 * still again — and because sections differ in height by 3-4x, it darted at a
 * different speed every time. Interpolating across the *whole* gap at a
 * constant parameter rate, with a spline rather than a per-segment blend,
 * removes both the dead zones and the speed mismatch.
 *
 * Section geometry is measured on resize and on layout changes rather than per
 * frame — `getBoundingClientRect` on six elements inside the render loop would
 * force a layout flush every frame.
 */
const useGlobePath = (snap: RefObject<boolean>) => {
  const target = useRef<GlobeKey>({ ...SECTION_KEYS[0] });

  useEffect(() => {
    /** Keyframes sorted by the scroll offset at which they are reached. */
    let anchors: { at: number; key: GlobeKey }[] = [];
    /** Previous focus point, for detecting jumps. Infinity forces the first
     *  resolve to count as one. */
    let lastFocus = -Infinity;

    const resolve = () => {
      if (!anchors.length) return;
      const out = target.current;

      if (anchors.length === 1) {
        Object.assign(out, anchors[0].key);
        return;
      }

      const focus = window.scrollY + window.innerHeight / 2;

      if (Math.abs(focus - lastFocus) > window.innerHeight * 1.2) {
        snap.current = true;
      }
      lastFocus = focus;

      // Last segment whose start is at or before the focus point. Clamping `t`
      // below is what handles the two open ends, so the search only has to find
      // a valid segment index.
      let i = 0;
      while (i < anchors.length - 2 && focus >= anchors[i + 1].at) i++;

      const a = anchors[i];
      const b = anchors[i + 1];
      const t = clamp01((focus - a.at) / Math.max(1, b.at - a.at));

      // Duplicate the end keyframes to give the spline tangents at the ends.
      const p0 = (anchors[i - 1] ?? a).key;
      const p3 = (anchors[i + 2] ?? b).key;

      out.x = catmullRom(p0.x, a.key.x, b.key.x, p3.x, t);
      out.y = catmullRom(p0.y, a.key.y, b.key.y, p3.y, t);
      // A spline can overshoot its keyframes. On x/y that is a feature — it
      // reads as momentum — but a negative scale flips the geometry inside out
      // and a negative presence would too, so those two are clamped.
      out.scale = Math.max(
        0.05,
        catmullRom(p0.scale, a.key.scale, b.key.scale, p3.scale, t)
      );
      out.presence = clamp01(
        catmullRom(p0.presence, a.key.presence, b.key.presence, p3.presence, t)
      );
    };

    const measure = () => {
      const viewportCentre = window.innerHeight / 2;

      const measured = SECTION_KEYS.flatMap(({ id, at, ...key }) => {
        const element = document.getElementById(id);
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        // The scroll offset at which this keyframe's point in the section
        // passes the centre of the viewport.
        return [
          { at: rect.top + window.scrollY + rect.height * at, key },
        ];
      });

      const tail =
        document.documentElement.scrollHeight - viewportCentre;
      measured.push({ at: tail, key: TAIL_KEY });

      // Strictly increasing anchors, or the segment search and the `t`
      // normalisation below both break. A section taller than the rest can
      // legitimately push its centre past a later one on a short page.
      measured.sort((first, second) => first.at - second.at);
      anchors = measured.filter(
        (anchor, index) => index === 0 || anchor.at > measured[index - 1].at
      );

      resolve();
    };

    measure();
    window.addEventListener("scroll", resolve, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    // Sections grow as fonts and images settle, so the measurements have to be
    // refreshed rather than taken once on mount.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", resolve);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [snap]);

  return target;
};

/**
 * One channel of critically damped spring state.
 *
 * Critically damped means it converges as fast as possible without ever
 * overshooting, which is the difference between "settles" and "wobbles". The
 * integration is semi-implicit, so the denominator is `(1 + omega*dt)^2` and
 * the result is stable at any frame time — a plain exponential lerp of the
 * `value += (target - value) * k` sort has a velocity discontinuity every time
 * the target jumps, and it is exactly that discontinuity you see as a lurch.
 */
interface Damped {
  value: number;
  velocity: number;
}

const damp = (state: Damped, target: number, omega: number, dt: number) => {
  const decay = 1 + omega * dt;
  state.velocity =
    (state.velocity - omega * omega * dt * (state.value - target)) /
    (decay * decay);
  state.value += dt * state.velocity;
};

/** Orthonormal basis for the plane whose normal is `axis`. */
const planeBasis = (axis: Vector3) => {
  const normal = axis.clone().normalize();
  const reference =
    Math.abs(normal.y) > 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const u = new Vector3().crossVectors(normal, reference).normalize();
  const v = new Vector3().crossVectors(normal, u).normalize();
  return { u, v };
};

/* -------------------------------------------------------------------------- */
/*  Postprocessing                                                            */
/* -------------------------------------------------------------------------- */

const usePostprocessing = (dormant: RefObject<boolean>) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const composer = useMemo(() => {
    // `alpha` is deprecated in postprocessing — its buffers are always RGBA, so
    // transparency comes from the renderer's own context and clear alpha.
    const instance = new EffectComposer(gl, { multisampling: 0 });

    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(new EffectPass(camera, new SMAAEffect()));
    instance.addPass(
      new EffectPass(
        camera,
        // The spike shader ends in a pow(1/2.2) gamma, which lifts ordinary lit
        // rods to ~0.8 luminance. The threshold therefore has to sit very high
        // or bloom catches the entire silhouette and washes it to white — which
        // is exactly what happened at 0.62.
        new BloomEffect({
          mipmapBlur: true,
          luminanceThreshold: 0.95,
          luminanceSmoothing: 0.03,
          intensity: 0.9,
          kernelSize: KernelSize.MEDIUM,
          resolutionScale: 0.5,
          resolutionX: Resolution.AUTO_SIZE,
          resolutionY: Resolution.AUTO_SIZE,
        })
      )
    );
    // No vignette: it darkened the corners of an opaque backdrop, but now that
    // the canvas is transparent and floats over the site it would tint the
    // whole page instead.
    return instance;
  }, [gl, scene, camera]);

  useEffect(() => composer.setSize(size.width, size.height), [composer, size]);
  useEffect(() => () => composer.dispose(), [composer]);

  // Priority > 0 takes over rendering from R3F's default render loop. Ascending
  // priority means the scene update at priority 0 has already run for this
  // frame, so `dormant` reflects the state that is about to be drawn.
  useFrame((_, delta) => {
    // Over the hero the globe has no presence, and the hero's own artwork is
    // opaque anyway — so there is nothing to draw. Skipping the render keeps a
    // full-screen SMAA + bloom pass off the GPU for the whole first screen,
    // which matters because the hero is already running a second canvas for
    // the astronaut.
    if (dormant.current) return;
    composer.render(delta);
  }, 1);
};

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

interface GlobeSceneProps {
  count: number;
  paused: boolean;
  /** True on portrait/phone viewports — see `GLOBE.compactDrop`. */
  compact: boolean;
}

const GlobeScene: FC<GlobeSceneProps> = ({ count, paused, compact }) => {
  /** Set once the globe has faded out AND a clearing frame has been drawn. */
  const dormant = useRef(false);
  /** Consecutive frames the globe has been invisible for. */
  const idleFrames = useRef(0);

  usePostprocessing(dormant);

  const globe = useRef<Group>(null);
  const orbs = useRef<(Mesh | null)[]>([null, null, null, null]);
  // Uniforms are mutated through the material refs rather than the memoized
  // objects, so per-frame writes stay outside React's render-value graph.
  const spikeMaterial = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const intro = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 });
  /** Damped 0→1 proximity of the pointer to the globe on screen. */
  const hover = useRef(0);
  const cursorWorld = useRef(new Vector3());
  /** Accumulated idle yaw, in radians. */
  const idleSpin = useRef(0);
  /** Yaw contributed by scroll position, chased by a spring. */
  const scrollSpin = useRef<Damped>({ value: 0, velocity: 0 });
  /**
   * The position/scale actually rendered. Each channel is its own critically
   * damped spring chasing the path, which is what turns a sampled curve into
   * something with weight.
   */
  const travel = useRef<Record<keyof GlobeKey, Damped>>({
    x: { value: SECTION_KEYS[0].x, velocity: 0 },
    y: { value: SECTION_KEYS[0].y, velocity: 0 },
    scale: { value: SECTION_KEYS[0].scale, velocity: 0 },
    presence: { value: SECTION_KEYS[0].presence, velocity: 0 },
  });
  /**
   * Set when the viewport arrives somewhere it could not have scrolled to, so
   * the globe is placed outright instead of easing to it.
   *
   * Two cases matter: the first resolve after mount, because a reload restores
   * the previous scroll offset and the globe should already be where that
   * offset says rather than flying in from the top of the page; and any jump
   * larger than a viewport, which is a programmatic scroll rather than someone
   * scrolling. Owned here rather than inside the hook so it is a plain ref the
   * frame loop may write to.
   */
  const snap = useRef(true);
  const pathTarget = useGlobePath(snap);

  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const geometry = useMemo(
    () => createSpikeGeometry(count, GLOBE.sphereRadius),
    [count]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const bases = useMemo(
    () => ORBITS.map((orbit) => planeBasis(new Vector3(...orbit.axis))),
    []
  );

  const spikeUniforms = useMemo(
    () => ({
      u_scale: { value: GLOBE.spikeScale },
      u_breath: { value: 1 },
      u_push: { value: GLOBE.push },
      u_falloff: { value: GLOBE.falloff },
      u_glow: { value: GLOBE.glow },
      u_lightPosition: { value: LIGHT_POSITION.clone() },
      u_colorDeep: { value: new Color(THEME.deep) },
      u_colorBase: { value: new Color(THEME.base) },
      u_colorHot: { value: new Color(THEME.hot) },
      u_colorSpark: { value: new Color(THEME.spark) },
      u_colorRim: { value: new Color(THEME.rim) },
      u_orbs: { value: ORBITS.map(() => new Vector3()) },
      u_cursor: { value: new Vector3(0, 0, 999) },
      u_hover: { value: 0 },
      u_hoverRadius: { value: GLOBE.hoverRadius },
      u_hoverBulge: { value: GLOBE.hoverBulge },
    }),
    []
  );

  const orbUniforms = useMemo(
    () =>
      ORB_COLORS.map((color) => ({
        u_color: { value: new Color(color) },
        u_lightPosition: { value: LIGHT_POSITION.clone() },
        u_intensity: { value: 1.05 },
      })),
    []
  );

  // The canvas sits behind the page and is `pointer-events: none`, so it never
  // receives events of its own — the pointer is tracked on `window` instead.
  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  useFrame((_, delta) => {
    const step = Math.min(delta, 1 / 30);
    if (!paused) elapsed.current += step;

    const time = elapsed.current;

    // Intro: ease the globe up to full size on first reveal.
    intro.current = Math.min(1, intro.current + step / GLOBE.introDuration);
    const eased = 1 - Math.pow(1 - intro.current, 3);

    const uniforms = spikeMaterial.current?.uniforms;
    if (uniforms) {
      // Breathing keeps the silhouette alive even when the orbs are far away.
      uniforms.u_breath.value = 1 + Math.sin(time * 0.6) * 0.02;

      const orbPositions = uniforms.u_orbs.value as Vector3[];
      for (let i = 0; i < ORBITS.length; i++) {
        const orbit = ORBITS[i];
        const { u, v } = bases[i];
        const angle = orbit.dir * orbit.speed * time + orbit.phase;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        orbPositions[i]
          .set(u.x * cos + v.x * sin, u.y * cos + v.y * sin, u.z * cos + v.z * sin)
          .multiplyScalar(orbit.radius);
        orbs.current[i]?.position.copy(orbPositions[i]);
      }
    }

    // Chase the path. Each channel is an independent critically damped spring,
    // so the globe always arrives without overshoot and without the velocity
    // discontinuity a plain lerp produces when the target moves.
    const sampled = pathTarget.current;
    // Applied to the target rather than to the rendered value, so the springs
    // still see one continuous curve.
    const path = compact
      ? {
          x: sampled.x,
          y: sampled.y + GLOBE.compactDrop,
          scale: sampled.scale * GLOBE.compactScale,
          presence: sampled.presence,
        }
      : sampled;

    if (snap.current) {
      // Arrived somewhere unreachable by scrolling — place it, do not fly it.
      snap.current = false;
      for (const channel of ["x", "y", "scale", "presence"] as const) {
        travel.current[channel].value = path[channel];
        travel.current[channel].velocity = 0;
      }
    } else {
      const stiffness = GLOBE.travelStiffness;
      damp(travel.current.x, path.x, stiffness, step);
      damp(travel.current.y, path.y, stiffness, step);
      damp(travel.current.scale, path.scale, stiffness, step);
      damp(travel.current.presence, path.presence, stiffness, step);
    }

    const offsetX = travel.current.x.value;
    const offsetY = travel.current.y.value;
    const presence = clamp01(travel.current.presence.value);

    const fit =
      (Math.min(viewport.width, viewport.height) *
        GLOBE.fitFraction *
        Math.max(0.05, travel.current.scale.value) *
        presence) /
      GLOBE_OUTER_RADIUS;
    const worldRadius = GLOBE_OUTER_RADIUS * fit;
    const centreX = viewport.width * offsetX;
    const centreY = viewport.height * offsetY;

    // Shear the frustum so the on-axis globe lands where the path wants it.
    // fullWidth/fullHeight equal the canvas, so the rendered window is the same
    // size and the offset simply translates it.
    const lens = camera as PerspectiveCamera;
    if (lens.isPerspectiveCamera) {
      lens.setViewOffset(
        size.width,
        size.height,
        -offsetX * size.width,
        offsetY * size.height,
        size.width,
        size.height
      );
      lens.updateProjectionMatrix();
    }

    // Hover test in normalised device space. The globe's centre maps to NDC
    // directly because `viewport.width/height` are the world dimensions at
    // z = 0, so no projection matrix work is needed. Dividing each axis by its
    // own NDC radius turns the viewport's aspect distortion into a clean unit
    // circle test. The radius is floored because presence reaches 0 over the
    // hero, and 0/0 would put a NaN into the uniforms that never washes out.
    const ndcRadiusX = Math.max(1e-4, worldRadius / (viewport.width / 2));
    const ndcRadiusY = Math.max(1e-4, worldRadius / (viewport.height / 2));
    const dx = (pointer.current.x - centreX / (viewport.width / 2)) / ndcRadiusX;
    const dy = (pointer.current.y - centreY / (viewport.height / 2)) / ndcRadiusY;
    const reach = Math.sqrt(dx * dx + dy * dy);
    const hoverTarget = (1 - smoothstep(0.7, 1.15, reach)) * presence;

    hover.current +=
      (hoverTarget - hover.current) *
      Math.min(1, step / GLOBE.hoverSmoothing);

    if (globe.current) {
      // Damped tilt toward the cursor — a hint of parallax, nothing more.
      const targetX = paused ? 0 : -pointer.current.y * GLOBE.pointerTiltX;
      const targetY = paused ? 0 : pointer.current.x * GLOBE.pointerTiltY;
      tilt.current.x += (targetX - tilt.current.x) * Math.min(1, step * 3);
      tilt.current.y += (targetY - tilt.current.y) * Math.min(1, step * 3);

      if (!paused) {
        idleSpin.current +=
          step * (GLOBE.idleSpin + hover.current * GLOBE.hoverSpin);
        // Yaw is read from the scroll *position*, not from scroll velocity.
        // That is the whole fix for the old jitter: a velocity term has to
        // decay through zero every time you change direction, so every
        // trackpad nudge made the globe stutter and reverse. An angle taken
        // straight from the offset simply unwinds when you scroll back up,
        // which is what a trackball does and what the eye expects.
        damp(
          scrollSpin.current,
          window.scrollY * GLOBE.scrollYaw,
          GLOBE.yawStiffness,
          step
        );
      }

      globe.current.rotation.x = GLOBE.baseTilt + tilt.current.x;
      globe.current.rotation.y =
        idleSpin.current + scrollSpin.current.value + tilt.current.y;
      // rotation.z stays at 0. The previous version rolled the whole globe by
      // scroll momentum, so it visibly tipped over on every flick and righted
      // itself when you stopped — the single most distracting thing it did.
      globe.current.scale.setScalar(fit * (0.6 + 0.4 * eased));

      // The globe itself never leaves the optical axis — the camera's view
      // offset above is what places it on screen, which is what keeps it a
      // perfect circle even when part of it is past the viewport edge.
      globe.current.position.set(0, 0, 0);

      const showing = presence > 0.005;
      globe.current.visible = showing;
      // Let a couple of frames through after it disappears, so the composer
      // leaves the canvas cleared rather than frozen on the last lit frame.
      idleFrames.current = showing ? 0 : idleFrames.current + 1;
      dormant.current = idleFrames.current > 2;

      if (uniforms) {
        uniforms.u_hover.value = hover.current;

        // Convert the pointer into the globe's local space so the bulge tracks
        // it through the globe's own rotation and scale. Pushing the sample
        // point to the front of the sphere makes the spikes nearest the viewer
        // react, rather than those on the silhouette at the centre depth.
        globe.current.updateMatrixWorld();
        cursorWorld.current
          .set(
            (pointer.current.x * viewport.width) / 2,
            (pointer.current.y * viewport.height) / 2,
            worldRadius
          );
        globe.current.worldToLocal(cursorWorld.current);
        (uniforms.u_cursor.value as Vector3).copy(cursorWorld.current);
      }
    }

    // Orbs flare as the pointer nears. Reached through the mesh refs rather
    // than the memoized uniform objects.
    const orbBoost = 1.05 + hover.current * 0.45;
    for (const orb of orbs.current) {
      const orbMaterial = orb?.material as ShaderMaterial | undefined;
      if (orbMaterial) orbMaterial.uniforms.u_intensity.value = orbBoost;
    }
  });

  return (
    <>
      <group ref={globe}>
        {/* Opaque core so you never see through to the far side's spikes. */}
        <mesh renderOrder={-1}>
          <sphereGeometry args={[GLOBE.sphereRadius, 32, 32]} />
          <meshBasicMaterial color={THEME.core} />
        </mesh>

        <mesh geometry={geometry} renderOrder={0}>
          <shaderMaterial
            ref={spikeMaterial}
            vertexShader={spikeVertexShader}
            fragmentShader={spikeFragmentShader}
            uniforms={spikeUniforms}
          />
        </mesh>

        {ORB_COLORS.map((color, index) => (
          <mesh
            key={color}
            ref={(node) => {
              orbs.current[index] = node;
            }}
            renderOrder={1}
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            <shaderMaterial
              vertexShader={orbVertexShader}
              fragmentShader={orbFragmentShader}
              uniforms={orbUniforms[index]}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  Exported background                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Fixed, full-viewport WebGL layer mounted once for the whole page, sitting
 * BEHIND the site at `z-0`.
 *
 * It used to float above everything at `z-[60]`, which is what made it read as
 * something stuck to the screen rather than part of the page — a spiked ball
 * drifting over headings, cards and buttons. Dropping it to `z-0` and lifting
 * the content to `z-10` (see `home-page.tsx`) puts it where a background
 * belongs: visible through the gaps between sections and behind the glass
 * cards, never on top of anything you are reading.
 *
 * The canvas is transparent — there is no backdrop quad, so only the globe
 * paints and the page's own background shows through everywhere else. The
 * wrapper is `pointer-events: none`, so nothing here can swallow a click.
 *
 * Above the canvas sits a scrim. It does two jobs: it fades the sphere out as
 * it approaches the viewport edges, so a globe that is half off-screen ends in
 * a soft falloff instead of a hard straight cut, and it holds the globe far
 * enough down in contrast that text laid over it always reads. Tuning
 * brightness here rather than in the shader keeps it to one knob.
 */
export const ThemedGlobe: FC<ThemedGlobeProps> = ({ className }) => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isTablet = useMediaQuery({ maxWidth: 1280 });
  const prefersReducedMotion = useReducedMotion();

  const count = isMobile
    ? INSTANCE_COUNT.mobile
    : isTablet
    ? INSTANCE_COUNT.tablet
    : INSTANCE_COUNT.desktop;

  // Fully transparent clear, so only the globe paints and the page shows
  // through everywhere else.
  const handleCreated = useCallback((state: RootState) => {
    state.gl.setClearColor(0x000000, 0);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={twMerge("pointer-events-none fixed inset-0 z-0", className)}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, CAMERA_DISTANCE],
          near: 0.1,
          far: 60,
          fov: CAMERA_FOV,
        }}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          alpha: true,
        }}
        onCreated={handleCreated}
      >
        <GlobeScene
          count={count}
          paused={Boolean(prefersReducedMotion)}
          compact={isMobile}
        />
      </Canvas>

      {/* Scrim. The globe now lives in the bottom band of the viewport, so the
          vignette has to stay off the bottom — an evenly radial one would crush
          exactly the part of the frame the globe occupies. This is a wide,
          shallow falloff that only really bites in the corners, softening the
          straight line the viewport edge would otherwise cut across the sphere.
          rgb(3, 4, 18) is `--color-primary`, the page's own background, so the
          globe dissolves into the page rather than into grey. */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(3, 4, 18, 0.14)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(145% 115% at 50% 52%, rgba(3, 4, 18, 0) 48%, rgba(3, 4, 18, 0.28) 80%, rgba(3, 4, 18, 0.6) 100%)",
        }}
      />
      {/* Keeps the globe from crowding the fixed navbar. */}
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3, 4, 18, 0.9), rgba(3, 4, 18, 0))",
        }}
      />
    </div>
  );
};
