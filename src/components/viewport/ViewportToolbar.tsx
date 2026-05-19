"use client";

import { useViewportStore } from "@/store/viewportStore";

function ToolbarButton({
  active,
  onClick,
  children
}: {
  active?: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-1.5 text-xs transition ${
        active
          ? "border-cyan-500 bg-cyan-700/35 text-cyan-100"
          : "border-slate-700 bg-slate-900/92 text-slate-200 hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

export function ViewportToolbar() {
  const showWireframe = useViewportStore((state) => state.showWireframe);
  const showDimensions = useViewportStore((state) => state.showDimensions);
  const showAxisTriad = useViewportStore((state) => state.showAxisTriad);
  const requestCameraReset = useViewportStore((state) => state.requestCameraReset);
  const toggleWireframe = useViewportStore((state) => state.toggleWireframe);
  const toggleDimensions = useViewportStore((state) => state.toggleDimensions);
  const toggleAxisTriad = useViewportStore((state) => state.toggleAxisTriad);

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
      <ToolbarButton onClick={requestCameraReset}>Reset Camera</ToolbarButton>
      <ToolbarButton active={showWireframe} onClick={toggleWireframe}>
        Wireframe
      </ToolbarButton>
      <ToolbarButton active={showDimensions} onClick={toggleDimensions}>
        Dimensions
      </ToolbarButton>
      <ToolbarButton active={showAxisTriad} onClick={toggleAxisTriad}>
        Axis Triad
      </ToolbarButton>
    </div>
  );
}

