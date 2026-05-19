import { BoxGeometry, BufferGeometry, CylinderGeometry } from "three";
import type { ExtrudeDirection, ExtrudeFeature } from "@/features/extrude/types";
import type { CircleEntity, RectangleEntity, SketchEntity } from "@/features/sketch/types";

const SKETCH_PLANE_Y = 0.03;

export type ExtrudableSketchEntity = RectangleEntity | CircleEntity;

export function isExtrudableSketchEntity(entity: SketchEntity): entity is ExtrudableSketchEntity {
  return entity.type === "rectangle" || entity.type === "circle";
}

function computeExtrudeCenterY(depth: number, direction: ExtrudeDirection): number {
  switch (direction) {
    case "negative_z":
      return SKETCH_PLANE_Y - depth / 2;
    case "symmetric":
      return SKETCH_PLANE_Y;
    case "positive_z":
    default:
      return SKETCH_PLANE_Y + depth / 2;
  }
}

export function createExtrudeGeometry(
  feature: Pick<ExtrudeFeature, "depth" | "direction" | "entityType">,
  entity: ExtrudableSketchEntity
): BufferGeometry | null {
  const depth = Math.max(0.1, feature.depth);
  const centerY = computeExtrudeCenterY(depth, feature.direction);

  if (entity.type === "rectangle") {
    const width = Math.abs(entity.end.x - entity.start.x);
    const length = Math.abs(entity.end.y - entity.start.y);
    if (width < 1e-4 || length < 1e-4) {
      return null;
    }

    const centerX = (entity.start.x + entity.end.x) / 2;
    const centerZ = (entity.start.y + entity.end.y) / 2;
    const geometry = new BoxGeometry(width, depth, length);
    geometry.translate(centerX, centerY, centerZ);
    geometry.computeVertexNormals();
    return geometry;
  }

  if (entity.type === "circle") {
    if (entity.radius < 1e-4) {
      return null;
    }

    const geometry = new CylinderGeometry(entity.radius, entity.radius, depth, 72, 1, false);
    geometry.translate(entity.center.x, centerY, entity.center.y);
    geometry.computeVertexNormals();
    return geometry;
  }

  return null;
}

