import { BufferGeometry, ExtrudeGeometry, Shape, Path } from "three";
import type { WasherParameters } from "@/features/washer/types";

const LOCK_GAP_ANGLE = (26 * Math.PI) / 180;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(theta: number): number {
  const twoPi = Math.PI * 2;
  return ((theta % twoPi) + twoPi) % twoPi;
}

function makeAnnularShape(outerRadius: number, innerRadius: number): Shape {
  const shape = new Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const hole = new Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function makeSplitRingShape(outerRadius: number, innerRadius: number, gapAngle: number): Shape {
  const start = gapAngle / 2;
  const end = Math.PI * 2 - gapAngle / 2;

  const shape = new Shape();
  shape.moveTo(Math.cos(start) * outerRadius, Math.sin(start) * outerRadius);
  shape.absarc(0, 0, outerRadius, start, end, false);
  shape.lineTo(Math.cos(end) * innerRadius, Math.sin(end) * innerRadius);
  shape.absarc(0, 0, innerRadius, end, start, true);
  shape.closePath();
  return shape;
}

function applyChamferProfile(
  geometry: ExtrudeGeometry,
  outerRadius: number,
  innerRadius: number,
  thickness: number,
  chamferSize: number
): void {
  if (chamferSize <= 0) {
    return;
  }

  const positions = geometry.attributes.position;
  const halfThickness = thickness / 2;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radius = Math.hypot(x, y);

    if (radius < 1e-6) {
      continue;
    }

    const faceDistance = halfThickness - Math.abs(z);
    const faceBlend = 1 - clamp(faceDistance / chamferSize, 0, 1);

    if (faceBlend <= 0) {
      continue;
    }

    const outerBlend = 1 - clamp((outerRadius - radius) / chamferSize, 0, 1);
    const innerBlend = 1 - clamp((radius - innerRadius) / chamferSize, 0, 1);
    const radialOffset = (innerBlend - outerBlend) * chamferSize * 0.65 * faceBlend;

    if (radialOffset === 0) {
      continue;
    }

    const targetRadius = clamp(radius + radialOffset, innerRadius + 0.02, outerRadius - 0.02);
    const scale = targetRadius / radius;
    positions.setXYZ(i, x * scale, y * scale, z);
  }

  positions.needsUpdate = true;
}

function applySpringRise(
  geometry: ExtrudeGeometry,
  thickness: number,
  startAngle: number,
  endAngle: number
): void {
  const positions = geometry.attributes.position;
  const span = endAngle - startAngle;
  const rise = thickness * 0.55;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const theta = normalizeAngle(Math.atan2(y, x));
    const clampedTheta = clamp(theta, startAngle, endAngle);
    const t = (clampedTheta - startAngle) / span;
    const zOffset = (t - 0.5) * rise;

    positions.setZ(i, z + zOffset);
  }

  positions.needsUpdate = true;
}

export function createWasherGeometry(input: WasherParameters): BufferGeometry {
  const outerRadius = Math.max(input.outerRadius, 0.8);
  const innerRadius = clamp(input.innerRadius, 0.1, outerRadius - 0.25);
  const thickness = Math.max(input.thickness, 0.2);
  const chamferSize = clamp(input.chamferSize, 0, Math.min(thickness * 0.5, (outerRadius - innerRadius) * 0.45));
  const washerType = input.washerType;

  const shape =
    washerType === "flat"
      ? makeAnnularShape(outerRadius, innerRadius)
      : makeSplitRingShape(outerRadius, innerRadius, LOCK_GAP_ANGLE);

  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness,
    steps: washerType === "spring" ? Math.max(18, Math.round(thickness * 10)) : 1,
    bevelEnabled: false,
    curveSegments: 96
  });
  geometry.translate(0, 0, -thickness / 2);

  applyChamferProfile(geometry, outerRadius, innerRadius, thickness, chamferSize);

  if (washerType === "spring") {
    applySpringRise(geometry, thickness, LOCK_GAP_ANGLE / 2, Math.PI * 2 - LOCK_GAP_ANGLE / 2);
  }

  geometry.computeVertexNormals();
  return geometry;
}

