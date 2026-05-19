"use client";

import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useViewportStore } from "@/store/viewportStore";

export function AxisTriad() {
  const showAxisTriad = useViewportStore((state) => state.showAxisTriad);

  if (!showAxisTriad) {
    return null;
  }

  return (
    <GizmoHelper alignment="bottom-left" margin={[86, 86]}>
      <GizmoViewport
        axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
        labelColor="#dbeafe"
        axisHeadScale={1}
      />
    </GizmoHelper>
  );
}

