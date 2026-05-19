export type BracketType = "l_bracket" | "flat_plate";

export interface BracketParameters {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  holeRadius: number;
  holeCount: number;
  filletRadius: number;
  bracketType: BracketType;
}
