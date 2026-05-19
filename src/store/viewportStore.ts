"use client";

import { create } from "zustand";

interface ViewportState {
  showWireframe: boolean;
  showDimensions: boolean;
  showAxisTriad: boolean;
  cameraResetVersion: number;
  toggleWireframe: () => void;
  toggleDimensions: () => void;
  toggleAxisTriad: () => void;
  requestCameraReset: () => void;
}

export const useViewportStore = create<ViewportState>((set) => ({
  showWireframe: false,
  showDimensions: true,
  showAxisTriad: true,
  cameraResetVersion: 0,
  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  toggleAxisTriad: () => set((state) => ({ showAxisTriad: !state.showAxisTriad })),
  requestCameraReset: () =>
    set((state) => ({
      cameraResetVersion: state.cameraResetVersion + 1
    }))
}));

