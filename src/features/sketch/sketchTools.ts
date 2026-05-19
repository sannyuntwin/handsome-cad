import type {
  CircleEntity,
  LineEntity,
  RectangleEntity,
  SketchEntity,
  SketchPoint,
  SketchTool
} from "@/features/sketch/types";

export type SketchDraft = Omit<LineEntity, "id"> | Omit<RectangleEntity, "id"> | Omit<CircleEntity, "id">;

const EPSILON = 1e-5;

export function createDraftEntity(tool: SketchTool, start: SketchPoint): SketchDraft | null {
  switch (tool) {
    case "line":
      return { type: "line", start, end: start };
    case "rectangle":
      return { type: "rectangle", start, end: start };
    case "circle":
      return { type: "circle", center: start, radius: 0 };
    default:
      return null;
  }
}

export function updateDraftEntity(draft: SketchDraft, point: SketchPoint): SketchDraft {
  switch (draft.type) {
    case "line":
      return { ...draft, end: point };
    case "rectangle":
      return { ...draft, end: point };
    case "circle":
      return {
        ...draft,
        radius: distance2D(draft.center, point)
      };
    default:
      return draft;
  }
}

export function finalizeDraftEntity(draft: SketchDraft, id: string): SketchEntity | null {
  switch (draft.type) {
    case "line":
      return distance2D(draft.start, draft.end) > EPSILON ? { id, ...draft } : null;
    case "rectangle":
      return distance2D(draft.start, draft.end) > EPSILON ? { id, ...draft } : null;
    case "circle":
      return draft.radius > EPSILON ? { id, ...draft } : null;
    default:
      return null;
  }
}

export function getEntityDisplayLabel(entity: SketchEntity): string {
  switch (entity.type) {
    case "line":
      return `Line (${entity.id})`;
    case "rectangle":
      return `Rectangle (${entity.id})`;
    case "circle":
      return `Circle (${entity.id})`;
  }
}

export function findHoveredEntity(entities: SketchEntity[], point: SketchPoint, tolerance: number): string | null {
  let nearestId: string | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const entity of entities) {
    const distance = distancePointToEntity(entity, point);
    if (distance <= tolerance && distance < nearestDistance) {
      nearestDistance = distance;
      nearestId = entity.id;
    }
  }

  return nearestId;
}

function distance2D(a: SketchPoint, b: SketchPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distancePointToLineSegment(point: SketchPoint, a: SketchPoint, b: SketchPoint): number {
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const abLenSq = abX * abX + abY * abY;
  if (abLenSq <= EPSILON) {
    return distance2D(point, a);
  }

  const apX = point.x - a.x;
  const apY = point.y - a.y;
  const t = Math.min(1, Math.max(0, (apX * abX + apY * abY) / abLenSq));
  const projX = a.x + abX * t;
  const projY = a.y + abY * t;
  return Math.hypot(point.x - projX, point.y - projY);
}

function distancePointToRectangle(point: SketchPoint, rect: RectangleEntity): number {
  const minX = Math.min(rect.start.x, rect.end.x);
  const maxX = Math.max(rect.start.x, rect.end.x);
  const minY = Math.min(rect.start.y, rect.end.y);
  const maxY = Math.max(rect.start.y, rect.end.y);

  const edges: [SketchPoint, SketchPoint][] = [
    [{ x: minX, y: minY }, { x: maxX, y: minY }],
    [{ x: maxX, y: minY }, { x: maxX, y: maxY }],
    [{ x: maxX, y: maxY }, { x: minX, y: maxY }],
    [{ x: minX, y: maxY }, { x: minX, y: minY }]
  ];

  return Math.min(...edges.map(([a, b]) => distancePointToLineSegment(point, a, b)));
}

function distancePointToEntity(entity: SketchEntity, point: SketchPoint): number {
  switch (entity.type) {
    case "line":
      return distancePointToLineSegment(point, entity.start, entity.end);
    case "rectangle":
      return distancePointToRectangle(point, entity);
    case "circle":
      return Math.abs(distance2D(point, entity.center) - entity.radius);
    default:
      return Number.POSITIVE_INFINITY;
  }
}
