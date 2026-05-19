import { BufferGeometry, CylinderGeometry } from "three";
import type { ShaftParameters } from "@/features/shaft/types";

export function createShaftGeometry(params: ShaftParameters): BufferGeometry {
  const geometry = new CylinderGeometry(params.radius, params.radius, params.length, 72, 1, false);

  // Align shaft axis with local Z so viewport rotations are consistent with gears.
  geometry.rotateX(Math.PI / 2);
  geometry.computeVertexNormals();

  return geometry;
}

