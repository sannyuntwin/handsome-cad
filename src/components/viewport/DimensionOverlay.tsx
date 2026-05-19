"use client";

import { useMemo } from "react";
import type { BoltParameters } from "@/features/bolt/types";
import type { BracketParameters } from "@/features/bracket/types";
import type { GearParameters } from "@/features/gear/types";
import type { NutParameters } from "@/features/nut/types";
import type { PartType } from "@/features/part/types";
import type { PulleyParameters } from "@/features/pulley/types";
import type { ShaftParameters } from "@/features/shaft/types";
import type { WasherParameters } from "@/features/washer/types";
import { computeGearDimensions } from "@/lib/math/gear";
import { useViewportStore } from "@/store/viewportStore";

interface DimensionOverlayProps {
  partType: PartType;
  gearParameters: GearParameters;
  shaftParameters: ShaftParameters;
  pulleyParameters: PulleyParameters;
  boltParameters: BoltParameters;
  nutParameters: NutParameters;
  washerParameters: WasherParameters;
  bracketParameters: BracketParameters;
}

export function DimensionOverlay({
  partType,
  gearParameters,
  shaftParameters,
  pulleyParameters,
  boltParameters,
  nutParameters,
  washerParameters,
  bracketParameters
}: DimensionOverlayProps) {
  const showDimensions = useViewportStore((state) => state.showDimensions);
  const gearDimensions = useMemo(() => computeGearDimensions(gearParameters), [gearParameters]);
  const pulleyDimensions = useMemo(
    () => ({
      outerDiameter: pulleyParameters.outerRadius * 2,
      boreDiameter: pulleyParameters.boreRadius * 2,
      grooveDiameter: Math.max((pulleyParameters.outerRadius - pulleyParameters.grooveDepth) * 2, 0)
    }),
    [pulleyParameters]
  );
  const boltDimensions = useMemo(
    () => ({
      totalLength: boltParameters.shaftLength + boltParameters.headHeight,
      shaftDiameter: boltParameters.shaftRadius * 2,
      headDiameter: boltParameters.headRadius * 2
    }),
    [boltParameters]
  );
  const nutDimensions = useMemo(
    () => ({
      outerDiameter: nutParameters.outerRadius * 2,
      boreDiameter: nutParameters.boreRadius * 2
    }),
    [nutParameters]
  );
  const washerDimensions = useMemo(
    () => ({
      outerDiameter: washerParameters.outerRadius * 2,
      innerDiameter: washerParameters.innerRadius * 2
    }),
    [washerParameters]
  );
  const bracketDimensions = useMemo(
    () => ({
      holeDiameter: bracketParameters.holeRadius * 2
    }),
    [bracketParameters]
  );

  if (!showDimensions) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute top-3 right-3 z-20 w-64 rounded border border-slate-700/90 bg-slate-950/88 p-3 text-xs text-slate-100 shadow-2xl backdrop-blur">
      <p className="mb-2 tracking-[0.16em] text-cyan-300 uppercase">Live Dimensions</p>

      {partType === "gear" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Outer Diameter</dt>
          <dd className="mono">{gearDimensions.outerDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Pitch Diameter</dt>
          <dd className="mono">{gearDimensions.pitchDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Root Diameter</dt>
          <dd className="mono">{gearDimensions.rootDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Base Diameter</dt>
          <dd className="mono">{gearDimensions.baseDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Thickness</dt>
          <dd className="mono">{gearParameters.thickness.toFixed(3)}</dd>
          <dt className="text-slate-400">Bore Diameter</dt>
          <dd className="mono">{(gearParameters.boreRadius * 2).toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "shaft" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Length</dt>
          <dd className="mono">{shaftParameters.length.toFixed(3)}</dd>
          <dt className="text-slate-400">Diameter</dt>
          <dd className="mono">{(shaftParameters.radius * 2).toFixed(3)}</dd>
          <dt className="text-slate-400">Keyway Width</dt>
          <dd className="mono">{shaftParameters.keywayWidth.toFixed(3)}</dd>
          <dt className="text-slate-400">Keyway Depth</dt>
          <dd className="mono">{shaftParameters.keywayDepth.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "pulley" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Outer Diameter</dt>
          <dd className="mono">{pulleyDimensions.outerDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Bore Diameter</dt>
          <dd className="mono">{pulleyDimensions.boreDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Width</dt>
          <dd className="mono">{pulleyParameters.width.toFixed(3)}</dd>
          <dt className="text-slate-400">Groove Diameter</dt>
          <dd className="mono">{pulleyDimensions.grooveDiameter.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "bolt" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Total Length</dt>
          <dd className="mono">{boltDimensions.totalLength.toFixed(3)}</dd>
          <dt className="text-slate-400">Shaft Diameter</dt>
          <dd className="mono">{boltDimensions.shaftDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Head Diameter</dt>
          <dd className="mono">{boltDimensions.headDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Thread Pitch</dt>
          <dd className="mono">{boltParameters.threadPitch.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "nut" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Outer Diameter</dt>
          <dd className="mono">{nutDimensions.outerDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Bore Diameter</dt>
          <dd className="mono">{nutDimensions.boreDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Thickness</dt>
          <dd className="mono">{nutParameters.thickness.toFixed(3)}</dd>
          <dt className="text-slate-400">Thread Pitch</dt>
          <dd className="mono">{nutParameters.threadPitch.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "washer" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Outer Diameter</dt>
          <dd className="mono">{washerDimensions.outerDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Inner Diameter</dt>
          <dd className="mono">{washerDimensions.innerDiameter.toFixed(3)}</dd>
          <dt className="text-slate-400">Thickness</dt>
          <dd className="mono">{washerParameters.thickness.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType === "bracket" ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
          <dt className="text-slate-400">Width</dt>
          <dd className="mono">{bracketParameters.width.toFixed(3)}</dd>
          <dt className="text-slate-400">Height</dt>
          <dd className="mono">{bracketParameters.height.toFixed(3)}</dd>
          <dt className="text-slate-400">Depth</dt>
          <dd className="mono">{bracketParameters.depth.toFixed(3)}</dd>
          <dt className="text-slate-400">Thickness</dt>
          <dd className="mono">{bracketParameters.thickness.toFixed(3)}</dd>
          <dt className="text-slate-400">Hole Diameter</dt>
          <dd className="mono">{bracketDimensions.holeDiameter.toFixed(3)}</dd>
        </dl>
      ) : null}

      {partType !== "gear" &&
      partType !== "shaft" &&
      partType !== "pulley" &&
      partType !== "bolt" &&
      partType !== "nut" &&
      partType !== "washer" &&
      partType !== "bracket" ? (
        <p className="text-slate-400">Dimension overlay for `{partType}` will be added with full module modeling.</p>
      ) : null}
    </div>
  );
}
