import { BufferGeometry, ExtrudeGeometry, Path, Shape, Vector2 } from "three";
import type { NutParameters } from "@/features/nut/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createHexProfile(radius: number): Vector2[] {
  const points: Vector2[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6 + Math.PI / 6;
    points.push(new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
  }
  return points;
}

function createNutShape(params: NutParameters): Shape {
  const shape =
    params.nutType === "hex"
      ? new Shape(createHexProfile(params.outerRadius))
      : new Shape().absarc(0, 0, params.outerRadius, 0, Math.PI * 2, false);

  const hole = new Path();
  hole.absarc(0, 0, params.boreRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

function applyInternalThreadVisual(geometry: ExtrudeGeometry, params: NutParameters): void {
  if (!params.showThread) {
    return;
  }

  const positions = geometry.attributes.position;
  const threadBand = params.boreRadius + Math.min(1.2, params.threadDepth + 0.4);
  const threadDepth = clamp(params.threadDepth, 0, params.boreRadius - 0.12);
  const pitch = Math.max(params.threadPitch, 0.2);
  const halfThickness = params.thickness / 2;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radius = Math.hypot(x, y);

    if (radius > threadBand || radius < 1e-6) {
      continue;
    }

    const theta = Math.atan2(y, x);
    const helixPhase = ((z + halfThickness) / pitch) * Math.PI * 2 + theta;
    const inward = (Math.sin(helixPhase) + 1) * 0.5 * threadDepth;
    const targetRadius = Math.max(0.08, radius - inward);
    const scale = targetRadius / radius;

    positions.setXYZ(i, x * scale, y * scale, z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createNutGeometry(input: NutParameters): BufferGeometry {
  const outerRadius = Math.max(input.outerRadius, 0.8);
  const thickness = Math.max(input.thickness, 0.4);
  const boreRadius = clamp(input.boreRadius, 0.15, outerRadius - 0.25);
  const threadDepth = clamp(input.threadDepth, 0, boreRadius - 0.08);

  const params: NutParameters = {
    ...input,
    outerRadius,
    thickness,
    boreRadius,
    threadPitch: Math.max(input.threadPitch, 0.2),
    threadDepth,
    showThread: input.showThread
  };

  const shape = createNutShape(params);
  const geometry = new ExtrudeGeometry(shape, {
    depth: params.thickness,
    steps: Math.max(14, Math.round(params.thickness * 3)),
    bevelEnabled: false,
    curveSegments: params.nutType === "hex" ? 3 : 72
  });

  geometry.translate(0, 0, -params.thickness / 2);
  applyInternalThreadVisual(geometry, params);
  geometry.computeVertexNormals();

  return geometry;
}

