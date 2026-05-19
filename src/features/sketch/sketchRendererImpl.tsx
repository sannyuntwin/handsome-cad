"use client";

import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { findHoveredEntity, type SketchDraft } from "@/features/sketch/sketchTools";
import { useSketchStore } from "@/features/sketch/sketchStore";
import type { SketchEntity, SketchPoint } from "@/features/sketch/types";

const SKETCH_Y = 0.03;
const HOVER_TOLERANCE = 0.8;

const COLORS = {
  default: "#8b9bb7",
  hover: "#facc15",
  selected: "#22d3ee",
  draft: "#f97316",
  origin: "#f43f5e"
} as const;

function toSketchPoint(event: ThreeEvent<PointerEvent>): SketchPoint {
  return { x: event.point.x, y: event.point.z };
}

function toWorldPoint(point: SketchPoint): [number, number, number] {
  return [point.x, SKETCH_Y, point.y];
}

function rectangleCorners(
  start: SketchPoint,
  end: SketchPoint
): [SketchPoint, SketchPoint, SketchPoint, SketchPoint, SketchPoint] {
  return [
    { x: start.x, y: start.y },
    { x: end.x, y: start.y },
    { x: end.x, y: end.y },
    { x: start.x, y: end.y },
    { x: start.x, y: start.y }
  ];
}

function circlePoints(center: SketchPoint, radius: number, segments = 72): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (Math.PI * 2 * i) / segments;
    points.push([center.x + Math.cos(angle) * radius, SKETCH_Y, center.y + Math.sin(angle) * radius]);
  }
  return points;
}

function entityColor(entityId: string, selectedId: string | null, hoveredId: string | null): string {
  if (entityId === selectedId) {
    return COLORS.selected;
  }
  if (entityId === hoveredId) {
    return COLORS.hover;
  }
  return COLORS.default;
}

function DraftEntity({ draft }: { draft: SketchDraft }) {
  if (draft.type === "line") {
    return <Line points={[toWorldPoint(draft.start), toWorldPoint(draft.end)]} color={COLORS.draft} lineWidth={2} />;
  }

  if (draft.type === "rectangle") {
    const corners = rectangleCorners(draft.start, draft.end).map((point) => toWorldPoint(point));
    return <Line points={corners} color={COLORS.draft} lineWidth={2} />;
  }

  if (draft.type === "circle") {
    return <Line points={circlePoints(draft.center, draft.radius)} color={COLORS.draft} lineWidth={2} />;
  }

  return null;
}

function SketchEntityLines({
  entity,
  selectedId,
  hoveredId
}: {
  entity: SketchEntity;
  selectedId: string | null;
  hoveredId: string | null;
}) {
  const color = entityColor(entity.id, selectedId, hoveredId);

  if (entity.type === "line") {
    return <Line points={[toWorldPoint(entity.start), toWorldPoint(entity.end)]} color={color} lineWidth={2} />;
  }

  if (entity.type === "rectangle") {
    const corners = rectangleCorners(entity.start, entity.end).map((point) => toWorldPoint(point));
    return <Line points={corners} color={color} lineWidth={2} />;
  }

  return <Line points={circlePoints(entity.center, entity.radius)} color={color} lineWidth={2} />;
}

export function SketchRenderer() {
  const sketchMode = useSketchStore((state) => state.sketchMode);
  const activeTool = useSketchStore((state) => state.activeTool);
  const activeSketch = useSketchStore((state) => state.activeSketch);
  const selectedSketchEntity = useSketchStore((state) => state.selectedSketchEntity);
  const hoveredSketchEntity = useSketchStore((state) => state.hoveredSketchEntity);
  const draftEntity = useSketchStore((state) => state.draftEntity);
  const beginDraftAt = useSketchStore((state) => state.beginDraftAt);
  const updateDraftAt = useSketchStore((state) => state.updateDraftAt);
  const commitDraft = useSketchStore((state) => state.commitDraft);
  const cancelDraft = useSketchStore((state) => state.cancelDraft);
  const setHoveredSketchEntity = useSketchStore((state) => state.setHoveredSketchEntity);
  const setSelectedSketchEntity = useSketchStore((state) => state.setSelectedSketchEntity);
  const finalizeCurrentSketch = useSketchStore((state) => state.finalizeCurrentSketch);
  const [isDragging, setIsDragging] = useState(false);

  const entityList = useMemo(() => activeSketch.entities, [activeSketch.entities]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (sketchMode !== "sketch") {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        cancelDraft();
        setIsDragging(false);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        finalizeCurrentSketch();
        setIsDragging(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cancelDraft, finalizeCurrentSketch, sketchMode]);

  if (sketchMode !== "sketch") {
    return null;
  }

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const point = toSketchPoint(event);

    if (activeTool === "select") {
      const hovered = findHoveredEntity(entityList, point, HOVER_TOLERANCE);
      setSelectedSketchEntity(hovered);
      return;
    }

    beginDraftAt(point);
    setIsDragging(true);
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const point = toSketchPoint(event);

    if (isDragging) {
      updateDraftAt(point);
      return;
    }

    const hovered = findHoveredEntity(entityList, point, HOVER_TOLERANCE);
    setHoveredSketchEntity(hovered);
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!isDragging) {
      return;
    }

    commitDraft();
    setIsDragging(false);
  };

  const onPointerLeave = () => {
    if (!isDragging) {
      setHoveredSketchEntity(null);
    }
  };

  return (
    <group>
      <gridHelper args={[160, 80, "#2f3f62", "#1a2945"]} position={[0, 0.005, 0]} />

      <Line points={[[-2, SKETCH_Y, 0], [2, SKETCH_Y, 0]]} color={COLORS.origin} lineWidth={2} />
      <Line points={[[0, SKETCH_Y, -2], [0, SKETCH_Y, 2]]} color={COLORS.origin} lineWidth={2} />

      {entityList.map((entity) => (
        <SketchEntityLines
          key={entity.id}
          entity={entity}
          selectedId={selectedSketchEntity}
          hoveredId={hoveredSketchEntity}
        />
      ))}

      {draftEntity ? <DraftEntity draft={draftEntity} /> : null}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SKETCH_Y, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

