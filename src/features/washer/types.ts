export type WasherType = "flat" | "spring" | "lock";

export interface WasherParameters {
  outerRadius: number;
  innerRadius: number;
  thickness: number;
  chamferSize: number;
  washerType: WasherType;
}
