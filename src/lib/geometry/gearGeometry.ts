import { BufferGeometry, ExtrudeGeometry } from "three";
import type { GearParameters } from "@/features/gear/types";
import { createSpurGearShape } from "@/lib/geometry/gearProfile";

export function createSpurGearGeometry(params: GearParameters): BufferGeometry {
  const shape = createSpurGearShape(params);
  const geometry = new ExtrudeGeometry(shape, {
    depth: params.thickness,
    steps: 1,
    bevelEnabled: false,
    curveSegments: 8
  });

  // Keep the part centered around the world origin for easier camera control.
  geometry.translate(0, 0, -params.thickness / 2);
  geometry.computeVertexNormals();

  return geometry;
}

