"use client";

import { create } from "zustand";
import { DEFAULT_EXTRUDE_DEPTH, DEFAULT_EXTRUDE_DIRECTION } from "@/features/extrude/defaults";
import type { ExtrudeDirection, ExtrudeFeature } from "@/features/extrude/types";
import type { PartType } from "@/features/part/types";

interface CreateExtrudePayload {
  partType: PartType;
  sketchId: string;
  entityId: string;
  entityType: "rectangle" | "circle";
  depth?: number;
  direction?: ExtrudeDirection;
}

interface ExtrudeState {
  extrudeFeatures: ExtrudeFeature[];
  selectedExtrudeFeatureId: string | null;
  nextFeatureIndex: number;
  addExtrudeFeature: (payload: CreateExtrudePayload) => string;
  updateExtrudeFeature: (featureId: string, patch: Partial<Pick<ExtrudeFeature, "depth" | "direction">>) => void;
  selectExtrudeFeature: (featureId: string | null) => void;
}

function normalizeDepth(depth: number | undefined): number {
  if (depth === undefined) {
    return DEFAULT_EXTRUDE_DEPTH;
  }
  return Math.max(0.1, depth);
}

export const useExtrudeStore = create<ExtrudeState>((set, get) => ({
  extrudeFeatures: [],
  selectedExtrudeFeatureId: null,
  nextFeatureIndex: 1,
  addExtrudeFeature: (payload) => {
    const state = get();
    const id = `ext-${state.nextFeatureIndex}`;
    const nextFeature: ExtrudeFeature = {
      id,
      name: `Extrude ${state.nextFeatureIndex}`,
      partType: payload.partType,
      sketchId: payload.sketchId,
      entityId: payload.entityId,
      entityType: payload.entityType,
      depth: normalizeDepth(payload.depth),
      direction: payload.direction ?? DEFAULT_EXTRUDE_DIRECTION
    };

    set({
      extrudeFeatures: [...state.extrudeFeatures, nextFeature],
      selectedExtrudeFeatureId: id,
      nextFeatureIndex: state.nextFeatureIndex + 1
    });

    return id;
  },
  updateExtrudeFeature: (featureId, patch) =>
    set((state) => ({
      extrudeFeatures: state.extrudeFeatures.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              ...(patch.depth !== undefined ? { depth: normalizeDepth(patch.depth) } : {}),
              ...(patch.direction !== undefined ? { direction: patch.direction } : {})
            }
          : feature
      )
    })),
  selectExtrudeFeature: (featureId) => set({ selectedExtrudeFeatureId: featureId })
}));
