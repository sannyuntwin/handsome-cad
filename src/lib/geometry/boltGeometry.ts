import { BufferGeometry, CylinderGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { BoltParameters } from "@/features/bolt/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyThreadVisual(shaftGeometry: CylinderGeometry, params: BoltParameters): void {
  if (!params.showThread) {
    return;
  }

  const positions = shaftGeometry.attributes.position;
  const threadPitch = Math.max(params.threadPitch, 0.2);
  const maxDepth = params.shaftRadius - 0.15;
  const threadDepth = clamp(params.threadDepth, 0, maxDepth);
  const shaftHalfLength = params.shaftLength / 2;
  const activeBand = params.shaftRadius - 0.7;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radius = Math.hypot(x, y);

    if (radius < activeBand || radius < 1e-6) {
      continue;
    }

    const normalized = clamp((z + shaftHalfLength) / params.shaftLength, 0, 1);
    const fade = Math.min(normalized / 0.08, 1, (1 - normalized) / 0.08);
    const theta = Math.atan2(y, x);
    const helixPhase = ((z + shaftHalfLength) / threadPitch) * Math.PI * 2 + theta;
    const radialOffset = Math.sin(helixPhase) * threadDepth * 0.5 * fade;
    const targetRadius = Math.max(0.12, radius + radialOffset);
    const scale = targetRadius / radius;

    positions.setXYZ(i, x * scale, y * scale, z);
  }

  positions.needsUpdate = true;
  shaftGeometry.computeVertexNormals();
}

export function createBoltGeometry(input: BoltParameters): BufferGeometry {
  const shaftRadius = Math.max(input.shaftRadius, 0.2);
  const shaftLength = Math.max(input.shaftLength, 1);
  const headRadius = Math.max(input.headRadius, shaftRadius + 0.2);
  const headHeight = Math.max(input.headHeight, 0.4);

  const params: BoltParameters = {
    ...input,
    shaftRadius,
    shaftLength,
    headRadius,
    headHeight,
    threadPitch: Math.max(input.threadPitch, 0.2),
    threadDepth: Math.max(input.threadDepth, 0),
    showThread: input.showThread
  };

  const shaftSegments = params.showThread ? 96 : 64;
  const shaftHeightSegments = params.showThread
    ? Math.max(28, Math.round(params.shaftLength / Math.max(params.threadPitch * 0.45, 0.3)))
    : 10;
  const shaft = new CylinderGeometry(
    params.shaftRadius,
    params.shaftRadius,
    params.shaftLength,
    shaftSegments,
    shaftHeightSegments,
    false
  );
  shaft.rotateX(Math.PI / 2);
  applyThreadVisual(shaft, params);
  shaft.translate(0, 0, -params.headHeight / 2);

  const headSegments = params.headType === "hex" ? 6 : 72;
  const head = new CylinderGeometry(
    params.headRadius,
    params.headRadius,
    params.headHeight,
    headSegments,
    1,
    false
  );
  head.rotateX(Math.PI / 2);
  head.translate(0, 0, params.shaftLength / 2);

  const merged = mergeGeometries([shaft, head], false);
  if (!merged) {
    shaft.dispose();
    head.dispose();
    throw new Error("Failed to build bolt geometry.");
  }

  merged.computeVertexNormals();
  shaft.dispose();
  head.dispose();

  return merged;
}

