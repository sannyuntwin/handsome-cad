import { BufferGeometry, CylinderGeometry } from "three";
import type { GearParameters } from "@/features/gear/types";
import type { PartType } from "@/features/part/types";
import type { ShaftParameters } from "@/features/shaft/types";
import type { BoltParameters } from "@/features/bolt/types";
import type { NutParameters } from "@/features/nut/types";
import type { PulleyParameters } from "@/features/pulley/types";
import type { WasherParameters } from "@/features/washer/types";
import type { BracketParameters } from "@/features/bracket/types";
import { createBracketGeometry } from "@/lib/geometry/bracketGeometry";
import { createBoltGeometry } from "@/lib/geometry/boltGeometry";
import { createGearGeometry } from "@/lib/geometry/gearGeometryFactory";
import { createNutGeometry } from "@/lib/geometry/nutGeometry";
import { createPulleyGeometry } from "@/lib/geometry/pulleyGeometry";
import { createShaftGeometry } from "@/lib/geometry/shaftGeometry";
import { createWasherGeometry } from "@/lib/geometry/washerGeometry";
import { computeGearDimensions } from "@/lib/math/gear";

export interface PartGeometryInput {
  partType: PartType;
  gearParameters: GearParameters;
  shaftParameters: ShaftParameters;
  pulleyParameters: PulleyParameters;
  boltParameters: BoltParameters;
  nutParameters: NutParameters;
  washerParameters: WasherParameters;
  bracketParameters: BracketParameters;
}

export interface PartGeometryResult {
  geometry: BufferGeometry;
  axisHalfLength: number;
}

export function createPartGeometry(input: PartGeometryInput): PartGeometryResult {
  switch (input.partType) {
    case "gear": {
      const geometry = createGearGeometry(input.gearParameters);
      const { outerDiameter } = computeGearDimensions(input.gearParameters);

      return {
        geometry,
        axisHalfLength: Math.max(input.gearParameters.thickness, outerDiameter * 1.25)
      };
    }
    case "shaft":
      return {
        geometry: createShaftGeometry(input.shaftParameters),
        axisHalfLength: Math.max(input.shaftParameters.length * 0.6, input.shaftParameters.radius * 4)
      };
    case "pulley":
      return {
        geometry: createPulleyGeometry(input.pulleyParameters),
        axisHalfLength: Math.max(
          input.pulleyParameters.width * 0.8,
          (input.pulleyParameters.outerRadius + input.pulleyParameters.flangeHeight) * 1.4
        )
      };
    case "bolt":
      return {
        geometry: createBoltGeometry(input.boltParameters),
        axisHalfLength: Math.max(
          (input.boltParameters.shaftLength + input.boltParameters.headHeight) * 0.7,
          input.boltParameters.headRadius * 2.2
        )
      };
    case "nut":
      return {
        geometry: createNutGeometry(input.nutParameters),
        axisHalfLength: Math.max(input.nutParameters.thickness * 1.8, input.nutParameters.outerRadius * 2)
      };
    case "washer":
      return {
        geometry: createWasherGeometry(input.washerParameters),
        axisHalfLength: Math.max(input.washerParameters.thickness * 3, input.washerParameters.outerRadius * 2)
      };
    case "bracket":
      return {
        geometry: createBracketGeometry(input.bracketParameters),
        axisHalfLength: Math.max(
          Math.max(input.bracketParameters.height, input.bracketParameters.depth) * 1.1,
          input.bracketParameters.width * 0.7
        )
      };
    default:
      return {
        geometry: createGearGeometry(input.gearParameters),
        axisHalfLength: Math.max(input.gearParameters.thickness, input.gearParameters.module * 10)
      };
  }
}
