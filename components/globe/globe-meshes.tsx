import { type RefObject } from "react";
import { type BufferGeometry, type Mesh, type ShaderMaterial } from "three";
import { GLOBE, ORB_COLORS, THEME } from "@/constants/globe-constants";
import {
  orbFragmentShader,
  orbVertexShader,
  spikeFragmentShader,
  spikeVertexShader,
} from "@/lib/globe/globe-shaders";

interface GlobeMeshesProps {
  geometry: BufferGeometry;
  spikeMaterial: RefObject<ShaderMaterial | null>;
  orbs: RefObject<(Mesh | null)[]>;
  spikeUniforms: Record<string, { value: unknown }>;
  orbUniforms: Record<string, { value: unknown }>[];
}

/** The drawable contents of the globe: core, spike field and orbiting orbs. */
export const GlobeMeshes = ({
  geometry,
  spikeMaterial,
  orbs,
  spikeUniforms,
  orbUniforms,
}: GlobeMeshesProps) => (
  <>
    {/* Opaque core, so you never see through to the far side's spikes. */}
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
  </>
);
