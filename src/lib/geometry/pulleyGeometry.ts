import { BufferGeometry, ExtrudeGeometry, Path, Shape } from "three";
import type { PulleyParameters } from "@/features/pulley/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildPulleyShape(outerRadius: number, boreRadius: number): Shape {
  const shape = new Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  const hole = new Path();
  hole.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

function shapeOuterSurface(geometry: ExtrudeGeometry, params: PulleyParameters): void {
  const positions = geometry.attributes.position;
  const halfWidth = params.width / 2;
  const edgeBand = Math.max(params.width * 0.16, params.grooveWidth * 0.5, 1);
  const outerShellThreshold = params.outerRadius - 0.75;
  const halfGroove = params.grooveWidth / 2;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radius = Math.hypot(x, y);

    if (radius < outerShellThreshold || radius <= 1e-6) {
      continue;
    }

    let radialOffset = 0;

    if (params.flangeHeight > 0) {
      const distanceToEdge = halfWidth - Math.abs(z);
      if (distanceToEdge < edgeBand) {
        const edgeFactor = 1 - clamp(distanceToEdge / edgeBand, 0, 1);
        radialOffset += params.flangeHeight * edgeFactor;
      }
    }

    if (params.showGroove && params.grooveDepth > 0 && halfGroove > 0 && Math.abs(z) < halfGroove) {
      // U-groove visual: deepest at center, tapering to zero at groove edges.
      const grooveBlend = 1 - Math.abs(z) / halfGroove;
      radialOffset -= params.grooveDepth * grooveBlend;
    }

    const targetRadius = Math.max(params.boreRadius + 0.2, radius + radialOffset);
    const scale = targetRadius / radius;
    positions.setXYZ(i, x * scale, y * scale, z);
  }

  positions.needsUpdate = true;
}

export function createPulleyGeometry(input: PulleyParameters): BufferGeometry {
  const outerRadius = Math.max(input.outerRadius, 1);
  const width = Math.max(input.width, 1);
  const boreRadius = clamp(input.boreRadius, 0.1, outerRadius - 0.5);
  const grooveDepth = clamp(input.grooveDepth, 0, outerRadius - boreRadius - 0.3);
  const grooveWidth = clamp(input.grooveWidth, 0.5, width * 0.95);
  const flangeHeight = Math.max(input.flangeHeight, 0);

  const params: PulleyParameters = {
    outerRadius,
    width,
    boreRadius,
    grooveDepth,
    grooveWidth,
    flangeHeight,
    showGroove: input.showGroove
  };

  const shape = buildPulleyShape(params.outerRadius, params.boreRadius);
  const geometry = new ExtrudeGeometry(shape, {
    depth: params.width,
    steps: Math.max(14, Math.round(params.width * 2)),
    bevelEnabled: false,
    curveSegments: 96
  });

  geometry.translate(0, 0, -params.width / 2);
  shapeOuterSurface(geometry, params);
  geometry.computeVertexNormals();

  return geometry;
}

