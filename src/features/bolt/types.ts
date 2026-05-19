export type BoltHeadType = "hex" | "cylindrical";

export interface BoltParameters {
  shaftRadius: number;
  shaftLength: number;
  headRadius: number;
  headHeight: number;
  threadPitch: number;
  threadDepth: number;
  showThread: boolean;
  headType: BoltHeadType;
}
