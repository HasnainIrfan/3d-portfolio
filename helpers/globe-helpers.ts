import {
  BufferGeometry,
  CapsuleGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Quaternion,
  Vector3,
} from "three";
import { type PlaneBasis } from "@/types/globe-types";

export const createSpikeGeometry = (
  count: number,
  radius: number
): BufferGeometry => {
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

    direction.set(-x, -posY, -z).normalize();
    quaternion.setFromUnitVectors(up, direction);
    quaternions[i4] = quaternion.x;
    quaternions[i4 + 1] = quaternion.y;
    quaternions[i4 + 2] = quaternion.z;
    quaternions[i4 + 3] = quaternion.w;

    randoms[i] = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
  }

  geometry.setAttribute(
    "a_instancePos",
    new InstancedBufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "a_instanceQuat",
    new InstancedBufferAttribute(quaternions, 4)
  );
  geometry.setAttribute(
    "a_instanceRand",
    new InstancedBufferAttribute(randoms, 1)
  );

  reference.dispose();
  return geometry;
};

export const planeBasis = (axis: Vector3): PlaneBasis => {
  const normal = axis.clone().normalize();
  const reference =
    Math.abs(normal.y) > 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const u = new Vector3().crossVectors(normal, reference).normalize();
  const v = new Vector3().crossVectors(normal, u).normalize();
  return { u, v };
};
