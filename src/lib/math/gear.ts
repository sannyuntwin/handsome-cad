import type { GearDerivedDimensions, GearParameters } from "@/features/gear/types";

export interface GearWorkingRadii {
  pitchRadius: number;
  outerRadius: number;
  rootRadius: number;
  baseRadius: number;
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function computeGearDimensions(params: GearParameters): GearDerivedDimensions {
  const pitchDiameter = params.module * params.teethCount;
  const outerDiameter = pitchDiameter + 2 * params.module;
  const rootDiameter = Math.max(
    pitchDiameter - 2.5 * params.module,
    params.boreRadius * 2 + params.module * 0.5
  );
  // Base diameter for involute gears: d_base = d_pitch * cos(pressureAngle)
  const baseDiameter = pitchDiameter * Math.cos(degToRad(params.pressureAngle));

  return {
    pitchDiameter,
    outerDiameter,
    rootDiameter,
    baseDiameter
  };
}

export function computeGearRadii(params: GearParameters): GearWorkingRadii {
  const { pitchDiameter, outerDiameter, rootDiameter, baseDiameter } = computeGearDimensions(params);

  return {
    pitchRadius: pitchDiameter / 2,
    outerRadius: outerDiameter / 2,
    rootRadius: rootDiameter / 2,
    baseRadius: baseDiameter / 2
  };
}

