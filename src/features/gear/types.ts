export type GearType = "spur" | "helical";

export interface GearParameters {
  gearType: GearType;
  teethCount: number;
  module: number;
  pressureAngle: number;
  thickness: number;
  boreRadius: number;
  helixAngle: number;
}

export interface GearDerivedDimensions {
  pitchDiameter: number;
  outerDiameter: number;
  rootDiameter: number;
  baseDiameter: number;
}

export type NumericGearParameterKey = Exclude<keyof GearParameters, "gearType">;
