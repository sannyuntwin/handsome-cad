import { Path, Shape, Vector2 } from "three";
import type { GearParameters } from "@/features/gear/types";
import { computeGearRadii } from "@/lib/math/gear";

function polarToCartesian(radius: number, angle: number): Vector2 {
  return new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

export function createSpurGearShape(params: GearParameters): Shape {
  const { teethCount, pressureAngle, boreRadius } = params;
  const { pitchRadius, outerRadius, rootRadius } = computeGearRadii(params);

  const pitchStep = (Math.PI * 2) / teethCount;
  const halfStep = pitchStep / 2;

  // Simplified profile shaping:
  // pressure angle slightly shifts the flank/pitch section widths to give a
  // more gear-like proportion without full involute math.
  const pressureLerp = Math.min(Math.max((pressureAngle - 14.5) / (25 - 14.5), 0), 1);
  const tipRatio = 0.34 - pressureLerp * 0.06;
  const pitchRatio = 0.68 - pressureLerp * 0.08;

  const outline: Vector2[] = [];

  for (let i = 0; i < teethCount; i += 1) {
    const center = i * pitchStep;
    const aRootLeft = center - halfStep;
    const aPitchLeft = center - halfStep * pitchRatio;
    const aTipLeft = center - halfStep * tipRatio;
    const aTipRight = center + halfStep * tipRatio;
    const aPitchRight = center + halfStep * pitchRatio;
    const aRootRight = center + halfStep;

    outline.push(
      polarToCartesian(rootRadius, aRootLeft),
      polarToCartesian(pitchRadius, aPitchLeft),
      polarToCartesian(outerRadius, aTipLeft),
      polarToCartesian(outerRadius, aTipRight),
      polarToCartesian(pitchRadius, aPitchRight),
      polarToCartesian(rootRadius, aRootRight)
    );
  }

  const shape = new Shape();
  const [firstPoint, ...rest] = outline;
  shape.moveTo(firstPoint.x, firstPoint.y);

  for (const point of rest) {
    shape.lineTo(point.x, point.y);
  }

  shape.closePath();

  if (boreRadius > 0) {
    const bore = new Path();
    // Hole winding is reversed (clockwise) so ExtrudeGeometry cuts the center.
    bore.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
    shape.holes.push(bore);
  }

  return shape;
}

