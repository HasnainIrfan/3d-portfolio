/**
 * GLSL for the globe. Kept as plain template strings rather than imported files
 * so the shaders travel with their uniform declarations and need no loader.
 */

export const spikeVertexShader = /* glsl */ `
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

export const spikeFragmentShader = /* glsl */ `
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

export const orbVertexShader = /* glsl */ `
varying vec3 v_worldPos;
varying vec3 v_worldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  v_worldPos = worldPosition.xyz;
  v_worldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const orbFragmentShader = /* glsl */ `
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
