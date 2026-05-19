"use client";

import { create } from "zustand";
import { createDraftEntity, finalizeDraftEntity, type SketchDraft, updateDraftEntity } from "@/features/sketch/sketchTools";
import type { Sketch, SketchMode, SketchPoint, SketchTool } from "@/features/sketch/types";

interface SketchState {
  sketchMode: SketchMode;
  activeTool: SketchTool;
  activeSketch: Sketch;
  selectedSketchEntity: string | null;
  hoveredSketchEntity: string | null;
  draftEntity: SketchDraft | null;
  nextEntityIndex: number;
  setSketchMode: (mode: SketchMode) => void;
  toggleSketchMode: () => void;
  setActiveTool: (tool: SketchTool) => void;
  setSelectedSketchEntity: (entityId: string | null) => void;
  setHoveredSketchEntity: (entityId: string | null) => void;
  beginDraftAt: (point: SketchPoint) => void;
  updateDraftAt: (point: SketchPoint) => void;
  commitDraft: () => void;
  cancelDraft: () => void;
  finalizeCurrentSketch: () => void;
}

const INITIAL_SKETCH: Sketch = {
  id: "sketch-xy-1",
  name: "Sketch 1",
  plane: "XY",
  entities: []
};

export const useSketchStore = create<SketchState>((set, get) => ({
  sketchMode: "view",
  activeTool: "line",
  activeSketch: INITIAL_SKETCH,
  selectedSketchEntity: null,
  hoveredSketchEntity: null,
  draftEntity: null,
  nextEntityIndex: 1,
  setSketchMode: (mode) =>
    set({
      sketchMode: mode,
      draftEntity: mode === "view" ? null : get().draftEntity
    }),
  toggleSketchMode: () =>
    set((state) => ({
      sketchMode: state.sketchMode === "view" ? "sketch" : "view",
      draftEntity: state.sketchMode === "view" ? state.draftEntity : null
    })),
  setActiveTool: (tool) =>
    set({
      activeTool: tool,
      draftEntity: null
    }),
  setSelectedSketchEntity: (entityId) => set({ selectedSketchEntity: entityId }),
  setHoveredSketchEntity: (entityId) => set({ hoveredSketchEntity: entityId }),
  beginDraftAt: (point) => {
    const { activeTool, sketchMode } = get();
    if (sketchMode !== "sketch") {
      return;
    }

    const draft = createDraftEntity(activeTool, point);
    set({
      draftEntity: draft
    });
  },
  updateDraftAt: (point) => {
    const { draftEntity } = get();
    if (!draftEntity) {
      return;
    }

    set({
      draftEntity: updateDraftEntity(draftEntity, point)
    });
  },
  commitDraft: () =>
    set((state) => {
      if (!state.draftEntity) {
        return state;
      }

      const entity = finalizeDraftEntity(state.draftEntity, `se-${state.nextEntityIndex}`);
      if (!entity) {
        return { draftEntity: null };
      }

      return {
        activeSketch: {
          ...state.activeSketch,
          entities: [...state.activeSketch.entities, entity]
        },
        draftEntity: null,
        selectedSketchEntity: entity.id,
        nextEntityIndex: state.nextEntityIndex + 1
      };
    }),
  cancelDraft: () =>
    set({
      draftEntity: null
    }),
  finalizeCurrentSketch: () => {
    get().commitDraft();
    set({
      draftEntity: null,
      activeTool: "select",
      sketchMode: "view",
      hoveredSketchEntity: null
    });
  }
}));

