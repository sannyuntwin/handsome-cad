import type { PartType } from "@/features/part/types";

export type ExtrudeDirection = "positive_z" | "negative_z" | "symmetric";

export interface ExtrudeFeature {
  id: string;
  name: string;
  partType: PartType;
  sketchId: string;
  entityId: string;
  entityType: "rectangle" | "circle";
  depth: number;
  direction: ExtrudeDirection;
}

