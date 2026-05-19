export type NutType = "hex" | "cylindrical";

export interface NutParameters {
  outerRadius: number;
  thickness: number;
  boreRadius: number;
  threadPitch: number;
  threadDepth: number;
  showThread: boolean;
  nutType: NutType;
}
