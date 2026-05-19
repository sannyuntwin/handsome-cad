import { BufferGeometry, ExtrudeGeometry } from "three";
import type { GearParameters } from "@/features/gear/types";
import { createSpurGearShape } from "@/lib/geometry/gearProfile";
import { computeGearRadii, degToRad } from "@/lib/math/gear";

function computeTwistRadians(params: GearParameters): number {
  const { pitchRadius } = computeGearRadii(params);

  if (pitchRadius <= 0) {
    return 0;
  }

  // Simplified helical approximation:
  // tangential shift at pitch cylinder is t * tan(beta), then converted to angle.
  return (params.thickness * Math.tan(degToRad(params.helixAngle))) / pitchRadius;
}

function applyAxialTwist(geometry: ExtrudeGeometry, thickness: number, twistRadians: number): void {
  if (thickness <= 0) {
    return;
  }

  const positions = geometry.attributes.position;
  const halfThickness = thickness / 2;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    const normalized = (z + halfThickness) / thickness;
    const localTwist = (normalized - 0.5) * twistRadians;
    const cosTheta = Math.cos(localTwist);
    const sinTheta = Math.sin(localTwist);

    positions.setXYZ(i, x * cosTheta - y * sinTheta, x * sinTheta + y * cosTheta, z);
  }

  positions.needsUpdate = true;
}

export function createHelicalGearGeometry(params: GearParameters): BufferGeometry {
  const shape = createSpurGearShape(params);
  const steps = Math.max(18, Math.round(params.thickness * 2));
  const geometry = new ExtrudeGeometry(shape, {
    depth: params.thickness,
    steps,
    bevelEnabled: false,
    curveSegments: 8
  });

  geometry.translate(0, 0, -params.thickness / 2);
  applyAxialTwist(geometry, params.thickness, computeTwistRadians(params));
  geometry.computeVertexNormals();

  return geometry;
}
