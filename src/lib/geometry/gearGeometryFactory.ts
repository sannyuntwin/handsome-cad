import type { BufferGeometry } from "three";
import type { GearParameters } from "@/features/gear/types";
import { createHelicalGearGeometry } from "@/lib/geometry/helicalGearGeometry";
import { createSpurGearGeometry } from "@/lib/geometry/gearGeometry";

export function createGearGeometry(params: GearParameters): BufferGeometry {
  switch (params.gearType) {
    case "helical":
      return createHelicalGearGeometry(params);
    case "spur":
    default:
      // Future expansion point: bevel/worm geometry routing can live here.
      return createSpurGearGeometry(params);
  }
}

