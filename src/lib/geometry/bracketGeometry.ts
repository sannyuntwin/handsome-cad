import { BufferGeometry, ExtrudeGeometry, Path, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { BracketParameters } from "@/features/bracket/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createRoundedRectShape(width: number, height: number, cornerRadius: number): Shape {
  const halfW = width / 2;
  const halfH = height / 2;
  const radius = clamp(cornerRadius, 0, Math.min(halfW, halfH));

  if (radius <= 0) {
    const rectangular = new Shape();
    rectangular.moveTo(-halfW, -halfH);
    rectangular.lineTo(halfW, -halfH);
    rectangular.lineTo(halfW, halfH);
    rectangular.lineTo(-halfW, halfH);
    rectangular.closePath();
    return rectangular;
  }

  const shape = new Shape();
  shape.moveTo(-halfW + radius, -halfH);
  shape.lineTo(halfW - radius, -halfH);
  shape.absarc(halfW - radius, -halfH + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(halfW, halfH - radius);
  shape.absarc(halfW - radius, halfH - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-halfW + radius, halfH);
  shape.absarc(-halfW + radius, halfH - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-halfW, -halfH + radius);
  shape.absarc(-halfW + radius, -halfH + radius, radius, Math.PI, Math.PI * 1.5, false);
  shape.closePath();

  return shape;
}

function computeHoleCenters(
  holeCount: number,
  spanX: number,
  spanY: number,
  holeRadius: number
): Vector2[] {
  const count = Math.max(Math.floor(holeCount), 0);
  if (count <= 0 || holeRadius <= 0) {
    return [];
  }

  const safeX = Math.max(spanX, 0);
  const safeY = Math.max(spanY, 0);

  if (count === 1) {
    return [new Vector2(0, 0)];
  }
  if (count === 2) {
    return [new Vector2(-safeX / 2, 0), new Vector2(safeX / 2, 0)];
  }

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const points: Vector2[] = [];

  for (let i = 0; i < count; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = cols === 1 ? 0 : -safeX / 2 + (safeX * col) / (cols - 1);
    const y = rows === 1 ? 0 : -safeY / 2 + (safeY * row) / (rows - 1);
    points.push(new Vector2(x, y));
  }

  return points;
}

function addCircularHoles(
  shape: Shape,
  plateWidth: number,
  plateHeight: number,
  holeRadius: number,
  holeCount: number,
  edgeClearance: number
): void {
  if (holeRadius <= 0 || holeCount <= 0) {
    return;
  }

  const spanX = plateWidth - 2 * (holeRadius + edgeClearance);
  const spanY = plateHeight - 2 * (holeRadius + edgeClearance);
  if (spanX <= 0 || spanY <= 0) {
    return;
  }

  const centers = computeHoleCenters(holeCount, spanX, spanY, holeRadius);
  for (const center of centers) {
    const hole = new Path();
    hole.absarc(center.x, center.y, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
}

function createPlateGeometry(
  width: number,
  height: number,
  thickness: number,
  holeRadius: number,
  holeCount: number,
  filletRadius: number
): ExtrudeGeometry {
  const cornerRadius = clamp(filletRadius, 0, Math.min(width, height) * 0.24);
  const shape = createRoundedRectShape(width, height, cornerRadius);
  addCircularHoles(shape, width, height, holeRadius, holeCount, Math.max(0.8, cornerRadius * 0.6));

  const bevelSize = clamp(filletRadius * 0.6, 0, Math.min(width, height, thickness) * 0.4);
  const bevelThickness = clamp(filletRadius * 0.45, 0, thickness * 0.35);
  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness,
    steps: 1,
    bevelEnabled: bevelSize > 0,
    bevelSize,
    bevelThickness,
    bevelSegments: bevelSize > 0 ? 2 : 0,
    curveSegments: 48
  });

  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

function createFlatPlateBracketGeometry(params: BracketParameters): BufferGeometry {
  const geometry = createPlateGeometry(
    params.width,
    params.height,
    params.thickness,
    params.holeRadius,
    params.holeCount,
    params.filletRadius
  );
  geometry.computeVertexNormals();
  return geometry;
}

function createLBracketGeometry(params: BracketParameters): BufferGeometry {
  const baseHoleCount = Math.ceil(params.holeCount / 2);
  const wallHoleCount = Math.floor(params.holeCount / 2);

  const basePlate = createPlateGeometry(
    params.width,
    params.depth,
    params.thickness,
    params.holeRadius,
    baseHoleCount,
    params.filletRadius
  );

  const wallPlate = createPlateGeometry(
    params.width,
    params.height,
    params.thickness,
    params.holeRadius,
    wallHoleCount,
    params.filletRadius
  );
  wallPlate.rotateX(Math.PI / 2);
  wallPlate.translate(0, params.depth / 2 - params.thickness / 2, params.height / 2 + params.thickness / 2);

  const merged = mergeGeometries([basePlate, wallPlate], false);
  if (!merged) {
    basePlate.dispose();
    wallPlate.dispose();
    throw new Error("Failed to build l-bracket geometry.");
  }

  merged.center();
  merged.computeVertexNormals();

  basePlate.dispose();
  wallPlate.dispose();

  return merged;
}

export function createBracketGeometry(input: BracketParameters): BufferGeometry {
  const width = Math.max(input.width, 2);
  const height = Math.max(input.height, 2);
  const depth = Math.max(input.depth, 2);
  const thickness = clamp(input.thickness, 0.5, Math.min(width, height, depth) * 0.5);
  const holeRadius = clamp(input.holeRadius, 0, Math.min(width, height, depth) * 0.2);
  const holeCount = clamp(Math.floor(input.holeCount), 0, 24);
  const filletRadius = clamp(input.filletRadius, 0, Math.min(width, height, depth) * 0.2);

  const params: BracketParameters = {
    ...input,
    width,
    height,
    depth,
    thickness,
    holeRadius,
    holeCount,
    filletRadius
  };

  if (params.bracketType === "flat_plate") {
    return createFlatPlateBracketGeometry(params);
  }

  return createLBracketGeometry(params);
}

