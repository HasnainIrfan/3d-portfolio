export const spikeVertexShader = `
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

  float cursorDist = length(basePos - u_cursor);
  float bulge = u_hover * (1.0 - smoothstep(0.0, u_hoverRadius, cursorDist));
  bulge *= bulge;

  vec3 pos = position;
  vec3 norm = normal;

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

export const spikeFragmentShader = `
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
  vec3 N = normalize(normalize(v_instancePos) + 0.2 * normalize(v_worldNormal));
  vec3 V = normalize(cameraPosition - v_worldPos);
  vec3 L = normalize(u_lightPosition - v_instancePos);
  float NdL = max(0.0, dot(N, L));

  float ao = gLinearStep(-0.5, -3.0, v_modelPos.y);

  float shadow = 0.15 + 0.85 * smoothstep(-0.3, 0.6, NdL);

  vec3 cool = mix(u_colorDeep, u_colorBase, smoothstep(-0.15, 1.0, NdL));

  vec3 hot = mix(u_colorHot, u_colorSpark, v_rand * 0.45);

  vec3 color = mix(cool, hot, smoothstep(0.16, 0.8, v_energy));

  color *= ao * ao;
  color *= shadow;

  float rim = pow(1.0 - max(0.0, dot(N, V)), 3.4);
  color += mix(u_colorBase, u_colorRim, 0.3) * rim * 0.55 * ao;

  vec3 H = normalize(V + L);
  float sheen = pow(max(0.0, dot(N, H)), 22.0);
  color += vec3(1.0) * sheen * 0.16 * ao;

  color += hot * smoothstep(0.42, 0.92, v_energy) * ao * u_glow;

  color += mix(u_colorRim, u_colorHot, v_rand) * v_bulge * 1.1;

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}
`;

export const orbVertexShader = `
varying vec3 v_worldPos;
varying vec3 v_worldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  v_worldPos = worldPosition.xyz;
  v_worldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const orbFragmentShader = `
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
  color += u_color * pow(NdV, 1.6) * 1.4;
  color += mix(u_color, vec3(1.0), 0.65) * fresnel * 1.8;
  color += vec3(1.0) * spec * 0.9;
  color *= u_intensity;

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}
`;
