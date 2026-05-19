"use client";

import { useMemo, useState } from "react";
import type { BoltParameters } from "@/features/bolt/types";
import type { BracketParameters } from "@/features/bracket/types";
import { DEFAULT_EXTRUDE_DEPTH, DEFAULT_EXTRUDE_DIRECTION } from "@/features/extrude/defaults";
import { useExtrudeStore } from "@/features/extrude/extrudeStore";
import type { ExtrudeDirection } from "@/features/extrude/types";
import type { GearParameters, NumericGearParameterKey } from "@/features/gear/types";
import type { NutParameters } from "@/features/nut/types";
import type { PartType } from "@/features/part/types";
import type { PulleyParameters } from "@/features/pulley/types";
import type { ShaftParameters } from "@/features/shaft/types";
import type { WasherParameters } from "@/features/washer/types";
import { getEntityDisplayLabel } from "@/features/sketch/sketchTools";
import { useSketchStore } from "@/features/sketch/sketchStore";
import type { SketchTool } from "@/features/sketch/types";
import { isExtrudableSketchEntity } from "@/lib/geometry/extrudeGeometry";
import { computeGearDimensions } from "@/lib/math/gear";
import { useGearStore } from "@/store/gearStore";

interface GearSidebarProps {
  onExportStl: () => void;
}

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function NumberField({ label, value, min, max, step, onChange }: NumberFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="cad-slider h-1.5 w-full cursor-pointer appearance-none rounded-full"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          type="number"
          className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-right text-sm text-slate-100 outline-none focus:border-cyan-500"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value || 0), min, max))}
        />
      </div>
    </label>
  );
}

interface GearParameterFieldProps<K extends NumericGearParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function GearParameterField<K extends NumericGearParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: GearParameterFieldProps<K>) {
  const value = useGearStore((state) => state.gearParameters[paramKey]);
  const setGearParameter = useGearStore((state) => state.setGearParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setGearParameter(paramKey, next as GearParameters[K])}
    />
  );
}

type NumericShaftParameterKey = Exclude<keyof ShaftParameters, "showKeywayCut">;

interface ShaftParameterFieldProps<K extends NumericShaftParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function ShaftParameterField<K extends NumericShaftParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: ShaftParameterFieldProps<K>) {
  const value = useGearStore((state) => state.shaftParameters[paramKey]);
  const setShaftParameter = useGearStore((state) => state.setShaftParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setShaftParameter(paramKey, next as ShaftParameters[K])}
    />
  );
}

type NumericPulleyParameterKey = Exclude<keyof PulleyParameters, "showGroove">;

interface PulleyParameterFieldProps<K extends NumericPulleyParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function PulleyParameterField<K extends NumericPulleyParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: PulleyParameterFieldProps<K>) {
  const value = useGearStore((state) => state.pulleyParameters[paramKey]);
  const setPulleyParameter = useGearStore((state) => state.setPulleyParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setPulleyParameter(paramKey, next as PulleyParameters[K])}
    />
  );
}

type NumericBoltParameterKey = Exclude<keyof BoltParameters, "showThread" | "headType">;

interface BoltParameterFieldProps<K extends NumericBoltParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function BoltParameterField<K extends NumericBoltParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: BoltParameterFieldProps<K>) {
  const value = useGearStore((state) => state.boltParameters[paramKey]);
  const setBoltParameter = useGearStore((state) => state.setBoltParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setBoltParameter(paramKey, next as BoltParameters[K])}
    />
  );
}

type NumericNutParameterKey = Exclude<keyof NutParameters, "showThread" | "nutType">;

interface NutParameterFieldProps<K extends NumericNutParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function NutParameterField<K extends NumericNutParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: NutParameterFieldProps<K>) {
  const value = useGearStore((state) => state.nutParameters[paramKey]);
  const setNutParameter = useGearStore((state) => state.setNutParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setNutParameter(paramKey, next as NutParameters[K])}
    />
  );
}

type NumericWasherParameterKey = Exclude<keyof WasherParameters, "washerType">;

interface WasherParameterFieldProps<K extends NumericWasherParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function WasherParameterField<K extends NumericWasherParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: WasherParameterFieldProps<K>) {
  const value = useGearStore((state) => state.washerParameters[paramKey]);
  const setWasherParameter = useGearStore((state) => state.setWasherParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setWasherParameter(paramKey, next as WasherParameters[K])}
    />
  );
}

type NumericBracketParameterKey = Exclude<keyof BracketParameters, "bracketType">;

interface BracketParameterFieldProps<K extends NumericBracketParameterKey> {
  label: string;
  paramKey: K;
  min: number;
  max: number;
  step: number;
}

function BracketParameterField<K extends NumericBracketParameterKey>({
  label,
  paramKey,
  min,
  max,
  step
}: BracketParameterFieldProps<K>) {
  const value = useGearStore((state) => state.bracketParameters[paramKey]);
  const setBracketParameter = useGearStore((state) => state.setBracketParameter);

  return (
    <NumberField
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => setBracketParameter(paramKey, next as BracketParameters[K])}
    />
  );
}

const PART_OPTIONS: { value: PartType; label: string }[] = [
  { value: "gear", label: "Gear" },
  { value: "shaft", label: "Shaft" },
  { value: "pulley", label: "Pulley" },
  { value: "bolt", label: "Bolt" },
  { value: "nut", label: "Nut" },
  { value: "washer", label: "Washer" },
  { value: "bracket", label: "Bracket" }
];

const SKETCH_TOOL_OPTIONS: { value: SketchTool; label: string }[] = [
  { value: "select", label: "Select" },
  { value: "line", label: "Line" },
  { value: "rectangle", label: "Rectangle" },
  { value: "circle", label: "Circle" }
];

const EXTRUDE_DIRECTION_OPTIONS: { value: ExtrudeDirection; label: string }[] = [
  { value: "positive_z", label: "Positive Z" },
  { value: "negative_z", label: "Negative Z" },
  { value: "symmetric", label: "Symmetric" }
];

function SketchToolButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2 py-1 text-xs transition ${
        active
          ? "border-cyan-500 bg-cyan-700/35 text-cyan-100"
          : "border-slate-700 bg-slate-900/92 text-slate-200 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function PartPlaceholderCard({ partType }: { partType: PartType }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
      <p className="tracking-[0.12em] text-slate-400 uppercase">Module Placeholder</p>
      <p className="mt-1">
        `{partType}` parameters are scaffolded and ready for full generator implementation.
      </p>
    </div>
  );
}

export function GearSidebar({ onExportStl }: GearSidebarProps) {
  const partType = useGearStore((state) => state.partType);
  const setPartType = useGearStore((state) => state.setPartType);
  const gearParameters = useGearStore((state) => state.gearParameters);
  const setGearParameter = useGearStore((state) => state.setGearParameter);
  const shaftParameters = useGearStore((state) => state.shaftParameters);
  const setShaftParameter = useGearStore((state) => state.setShaftParameter);
  const pulleyParameters = useGearStore((state) => state.pulleyParameters);
  const setPulleyParameter = useGearStore((state) => state.setPulleyParameter);
  const boltParameters = useGearStore((state) => state.boltParameters);
  const setBoltParameter = useGearStore((state) => state.setBoltParameter);
  const nutParameters = useGearStore((state) => state.nutParameters);
  const setNutParameter = useGearStore((state) => state.setNutParameter);
  const washerParameters = useGearStore((state) => state.washerParameters);
  const setWasherParameter = useGearStore((state) => state.setWasherParameter);
  const bracketParameters = useGearStore((state) => state.bracketParameters);
  const setBracketParameter = useGearStore((state) => state.setBracketParameter);

  const sketchMode = useSketchStore((state) => state.sketchMode);
  const setSketchMode = useSketchStore((state) => state.setSketchMode);
  const activeSketch = useSketchStore((state) => state.activeSketch);
  const activeTool = useSketchStore((state) => state.activeTool);
  const setActiveTool = useSketchStore((state) => state.setActiveTool);
  const selectedSketchEntity = useSketchStore((state) => state.selectedSketchEntity);
  const setSelectedSketchEntity = useSketchStore((state) => state.setSelectedSketchEntity);
  const finalizeCurrentSketch = useSketchStore((state) => state.finalizeCurrentSketch);
  const cancelDraft = useSketchStore((state) => state.cancelDraft);

  const extrudeFeatures = useExtrudeStore((state) => state.extrudeFeatures);
  const selectedExtrudeFeatureId = useExtrudeStore((state) => state.selectedExtrudeFeatureId);
  const addExtrudeFeature = useExtrudeStore((state) => state.addExtrudeFeature);
  const updateExtrudeFeature = useExtrudeStore((state) => state.updateExtrudeFeature);
  const selectExtrudeFeature = useExtrudeStore((state) => state.selectExtrudeFeature);

  const [extrudeDepthInput, setExtrudeDepthInput] = useState<number>(DEFAULT_EXTRUDE_DEPTH);
  const [extrudeDirectionInput, setExtrudeDirectionInput] = useState<ExtrudeDirection>(
    DEFAULT_EXTRUDE_DIRECTION
  );

  const resetCurrentPart = useGearStore((state) => state.resetCurrentPart);
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

  const selectedSketchEntityObject = useMemo(
    () => activeSketch.entities.find((entity) => entity.id === selectedSketchEntity) ?? null,
    [activeSketch.entities, selectedSketchEntity]
  );
  const selectedExtrudableEntity = useMemo(() => {
    if (selectedSketchEntityObject && isExtrudableSketchEntity(selectedSketchEntityObject)) {
      return selectedSketchEntityObject;
    }
    return activeSketch.entities.find((entity) => isExtrudableSketchEntity(entity)) ?? null;
  }, [activeSketch.entities, selectedSketchEntityObject]);
  const canCreateExtrude = sketchMode === "sketch" && selectedExtrudableEntity !== null;

  const currentPartExtrudes = useMemo(
    () => extrudeFeatures.filter((feature) => feature.partType === partType),
    [extrudeFeatures, partType]
  );
  const selectedExtrudeFeature = useMemo(
    () => extrudeFeatures.find((feature) => feature.id === selectedExtrudeFeatureId) ?? null,
    [extrudeFeatures, selectedExtrudeFeatureId]
  );

  const handleCreateExtrude = () => {
    if (!selectedExtrudableEntity) {
      return;
    }

    const createdId = addExtrudeFeature({
      partType,
      sketchId: activeSketch.id,
      entityId: selectedExtrudableEntity.id,
      entityType: selectedExtrudableEntity.type,
      depth: extrudeDepthInput,
      direction: extrudeDirectionInput
    });
    selectExtrudeFeature(createdId);
  };

  return (
    <aside className="flex h-full w-full flex-col border-b border-slate-800 bg-slate-900/70 p-4 backdrop-blur md:w-[360px] md:border-r md:border-b-0">
      <div className="mb-5">
        <p className="text-xs tracking-[0.22em] text-cyan-400 uppercase">Part Studio</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-100">Parametric Mechanical CAD</h1>
      </div>

      <label className="mb-4 space-y-2">
        <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Part Type</span>
        <select
          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          value={partType}
          onChange={(event) => setPartType(event.target.value as PartType)}
        >
          {PART_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-4 rounded border border-slate-800 bg-slate-950/65 p-3">
        <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Sketch Mode</p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSketchMode("view")}
            className={`rounded border px-2 py-1.5 text-xs transition ${
              sketchMode === "view"
                ? "border-cyan-500 bg-cyan-700/35 text-cyan-100"
                : "border-slate-700 bg-slate-900/92 text-slate-200 hover:bg-slate-800"
            }`}
          >
            View Mode
          </button>
          <button
            type="button"
            onClick={() => setSketchMode("sketch")}
            className={`rounded border px-2 py-1.5 text-xs transition ${
              sketchMode === "sketch"
                ? "border-cyan-500 bg-cyan-700/35 text-cyan-100"
                : "border-slate-700 bg-slate-900/92 text-slate-200 hover:bg-slate-800"
            }`}
          >
            Sketch Mode
          </button>
        </div>

        {sketchMode === "sketch" ? (
          <>
            <p className="mb-2 text-[11px] tracking-[0.12em] text-slate-400 uppercase">Tools</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SKETCH_TOOL_OPTIONS.map((tool) => (
                <SketchToolButton
                  key={tool.value}
                  label={tool.label}
                  active={activeTool === tool.value}
                  onClick={() => setActiveTool(tool.value)}
                />
              ))}
            </div>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={cancelDraft}
                className="rounded border border-slate-700 bg-slate-900/92 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
              >
                Cancel Tool (ESC)
              </button>
              <button
                type="button"
                onClick={finalizeCurrentSketch}
                className="rounded border border-cyan-600 bg-cyan-700/90 px-2 py-1 text-xs text-cyan-50 transition hover:bg-cyan-600"
              >
                Finalize (ENTER)
              </button>
            </div>

            <div className="mb-3 rounded border border-slate-700/60 bg-slate-900/40 p-2">
              <p className="mb-2 text-[11px] tracking-[0.12em] text-slate-400 uppercase">Extrude Tool</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Depth</span>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={extrudeDepthInput}
                    onChange={(event) => setExtrudeDepthInput(Math.max(0.1, Number(event.target.value || 0)))}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Direction</span>
                  <select
                    value={extrudeDirectionInput}
                    onChange={(event) => setExtrudeDirectionInput(event.target.value as ExtrudeDirection)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    {EXTRUDE_DIRECTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={handleCreateExtrude}
                disabled={!canCreateExtrude}
                className={`mt-2 w-full rounded border px-2 py-1 text-xs transition ${
                  canCreateExtrude
                    ? "border-cyan-600 bg-cyan-700/90 text-cyan-50 hover:bg-cyan-600"
                    : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                }`}
              >
                Create Extrude
              </button>
              <p className="mt-1 text-[10px] text-slate-500">
                Select a rectangle or circle sketch entity to enable extrusion.
              </p>
            </div>
          </>
        ) : null}

        <p className="mb-2 text-[11px] tracking-[0.12em] text-slate-400 uppercase">Entities ({activeSketch.entities.length})</p>
        <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
          {activeSketch.entities.length === 0 ? (
            <p className="text-xs text-slate-500">No sketch entities yet.</p>
          ) : (
            activeSketch.entities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => setSelectedSketchEntity(entity.id)}
                className={`block w-full rounded border px-2 py-1 text-left text-xs transition ${
                  selectedSketchEntity === entity.id
                    ? "border-cyan-500 bg-cyan-900/30 text-cyan-100"
                    : "border-slate-800 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {getEntityDisplayLabel(entity)}
              </button>
            ))
          )}
        </div>

        <p className="mb-2 mt-3 text-[11px] tracking-[0.12em] text-slate-400 uppercase">Feature Tree</p>
        <div className="space-y-1">
          <div className="rounded border border-slate-800 bg-slate-900/65 px-2 py-1 text-xs text-slate-200">
            {partType}
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/65 px-2 py-1 text-xs text-slate-300">
            Sketch: {activeSketch.name}
          </div>
          {currentPartExtrudes.length === 0 ? (
            <p className="px-1 text-[11px] text-slate-500">No extrude features yet.</p>
          ) : (
            currentPartExtrudes.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => selectExtrudeFeature(feature.id)}
                className={`block w-full rounded border px-2 py-1 text-left text-xs transition ${
                  selectedExtrudeFeatureId === feature.id
                    ? "border-cyan-500 bg-cyan-900/30 text-cyan-100"
                    : "border-slate-800 bg-slate-900/65 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {feature.name}
              </button>
            ))
          )}
        </div>

        {selectedExtrudeFeature ? (
          <div className="mt-3 rounded border border-slate-700/70 bg-slate-900/40 p-2">
            <p className="mb-2 text-[11px] tracking-[0.12em] text-slate-400 uppercase">Extrude Inspector</p>
            <label className="mb-2 block space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Depth</span>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={selectedExtrudeFeature.depth}
                onChange={(event) =>
                  updateExtrudeFeature(selectedExtrudeFeature.id, {
                    depth: Math.max(0.1, Number(event.target.value || 0))
                  })
                }
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Direction</span>
              <select
                value={selectedExtrudeFeature.direction}
                onChange={(event) =>
                  updateExtrudeFeature(selectedExtrudeFeature.id, {
                    direction: event.target.value as ExtrudeDirection
                  })
                }
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-500"
              >
                {EXTRUDE_DIRECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {partType === "gear" ? (
        <>
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Gear Type</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={gearParameters.gearType}
                onChange={(event) =>
                  setGearParameter("gearType", event.target.value as GearParameters["gearType"])
                }
              >
                <option value="spur">Spur</option>
                <option value="helical">Helical</option>
              </select>
            </label>

            <GearParameterField label="Teeth Count" paramKey="teethCount" min={8} max={120} step={1} />
            <GearParameterField label="Module" paramKey="module" min={0.5} max={10} step={0.1} />
            <GearParameterField
              label="Pressure Angle (deg)"
              paramKey="pressureAngle"
              min={14.5}
              max={25}
              step={0.5}
            />
            <GearParameterField label="Thickness (mm)" paramKey="thickness" min={2} max={60} step={0.5} />
            <GearParameterField label="Bore Radius (mm)" paramKey="boreRadius" min={0} max={40} step={0.1} />
            {gearParameters.gearType === "helical" ? (
              <GearParameterField
                label="Helix Angle (deg)"
                paramKey="helixAngle"
                min={1}
                max={45}
                step={0.5}
              />
            ) : null}
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Pitch Ø</dt>
              <dd className="text-right text-cyan-300">{gearDimensions.pitchDiameter.toFixed(3)}</dd>
              <dt>Outer Ø</dt>
              <dd className="text-right text-cyan-300">{gearDimensions.outerDiameter.toFixed(3)}</dd>
              <dt>Root Ø</dt>
              <dd className="text-right text-cyan-300">{gearDimensions.rootDiameter.toFixed(3)}</dd>
              <dt>Base Ø</dt>
              <dd className="text-right text-cyan-300">{gearDimensions.baseDiameter.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType === "shaft" ? (
        <div className="space-y-4">
          <ShaftParameterField label="Length (mm)" paramKey="length" min={10} max={300} step={1} />
          <ShaftParameterField label="Radius (mm)" paramKey="radius" min={1} max={60} step={0.2} />
          <ShaftParameterField label="Keyway Width (mm)" paramKey="keywayWidth" min={0} max={30} step={0.1} />
          <ShaftParameterField label="Keyway Depth (mm)" paramKey="keywayDepth" min={0} max={20} step={0.1} />

          <label className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={shaftParameters.showKeywayCut}
              onChange={(event) => setShaftParameter("showKeywayCut", event.target.checked)}
            />
            Show Keyway Cut Visual
          </label>
        </div>
      ) : null}

      {partType === "pulley" ? (
        <>
          <div className="space-y-4">
            <PulleyParameterField label="Outer Radius (mm)" paramKey="outerRadius" min={2} max={120} step={0.2} />
            <PulleyParameterField label="Width (mm)" paramKey="width" min={2} max={120} step={0.2} />
            <PulleyParameterField label="Bore Radius (mm)" paramKey="boreRadius" min={0.5} max={80} step={0.1} />
            <PulleyParameterField label="Groove Depth (mm)" paramKey="grooveDepth" min={0} max={20} step={0.1} />
            <PulleyParameterField label="Groove Width (mm)" paramKey="grooveWidth" min={0.5} max={80} step={0.1} />
            <PulleyParameterField label="Flange Height (mm)" paramKey="flangeHeight" min={0} max={20} step={0.1} />

            <label className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={pulleyParameters.showGroove}
                onChange={(event) => setPulleyParameter("showGroove", event.target.checked)}
              />
              Show Groove
            </label>
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Outer Ø</dt>
              <dd className="text-right text-cyan-300">{pulleyDimensions.outerDiameter.toFixed(3)}</dd>
              <dt>Bore Ø</dt>
              <dd className="text-right text-cyan-300">{pulleyDimensions.boreDiameter.toFixed(3)}</dd>
              <dt>Width</dt>
              <dd className="text-right text-cyan-300">{pulleyParameters.width.toFixed(3)}</dd>
              <dt>Groove Ø</dt>
              <dd className="text-right text-cyan-300">{pulleyDimensions.grooveDiameter.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType === "bolt" ? (
        <>
          <div className="space-y-4">
            <BoltParameterField label="Shaft Radius (mm)" paramKey="shaftRadius" min={0.5} max={40} step={0.1} />
            <BoltParameterField label="Shaft Length (mm)" paramKey="shaftLength" min={2} max={300} step={0.5} />
            <BoltParameterField label="Head Radius (mm)" paramKey="headRadius" min={0.6} max={60} step={0.1} />
            <BoltParameterField label="Head Height (mm)" paramKey="headHeight" min={0.4} max={60} step={0.1} />
            <BoltParameterField label="Thread Pitch (mm)" paramKey="threadPitch" min={0.2} max={10} step={0.1} />
            <BoltParameterField label="Thread Depth (mm)" paramKey="threadDepth" min={0} max={5} step={0.05} />

            <label className="space-y-2">
              <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Head Type</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={boltParameters.headType}
                onChange={(event) =>
                  setBoltParameter("headType", event.target.value as BoltParameters["headType"])
                }
              >
                <option value="hex">Hex</option>
                <option value="cylindrical">Cylindrical</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={boltParameters.showThread}
                onChange={(event) => setBoltParameter("showThread", event.target.checked)}
              />
              Show Thread
            </label>
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Total Length</dt>
              <dd className="text-right text-cyan-300">{boltDimensions.totalLength.toFixed(3)}</dd>
              <dt>Shaft Ø</dt>
              <dd className="text-right text-cyan-300">{boltDimensions.shaftDiameter.toFixed(3)}</dd>
              <dt>Head Ø</dt>
              <dd className="text-right text-cyan-300">{boltDimensions.headDiameter.toFixed(3)}</dd>
              <dt>Thread Pitch</dt>
              <dd className="text-right text-cyan-300">{boltParameters.threadPitch.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType === "nut" ? (
        <>
          <div className="space-y-4">
            <NutParameterField label="Outer Radius (mm)" paramKey="outerRadius" min={0.8} max={80} step={0.1} />
            <NutParameterField label="Thickness (mm)" paramKey="thickness" min={0.4} max={60} step={0.1} />
            <NutParameterField label="Bore Radius (mm)" paramKey="boreRadius" min={0.15} max={50} step={0.05} />
            <NutParameterField label="Thread Pitch (mm)" paramKey="threadPitch" min={0.2} max={10} step={0.1} />
            <NutParameterField label="Thread Depth (mm)" paramKey="threadDepth" min={0} max={5} step={0.05} />

            <label className="space-y-2">
              <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Nut Type</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={nutParameters.nutType}
                onChange={(event) => setNutParameter("nutType", event.target.value as NutParameters["nutType"])}
              >
                <option value="hex">Hex</option>
                <option value="cylindrical">Cylindrical</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={nutParameters.showThread}
                onChange={(event) => setNutParameter("showThread", event.target.checked)}
              />
              Show Thread
            </label>
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Outer Ø</dt>
              <dd className="text-right text-cyan-300">{nutDimensions.outerDiameter.toFixed(3)}</dd>
              <dt>Bore Ø</dt>
              <dd className="text-right text-cyan-300">{nutDimensions.boreDiameter.toFixed(3)}</dd>
              <dt>Thickness</dt>
              <dd className="text-right text-cyan-300">{nutParameters.thickness.toFixed(3)}</dd>
              <dt>Thread Pitch</dt>
              <dd className="text-right text-cyan-300">{nutParameters.threadPitch.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType === "washer" ? (
        <>
          <div className="space-y-4">
            <WasherParameterField label="Outer Radius (mm)" paramKey="outerRadius" min={0.8} max={120} step={0.1} />
            <WasherParameterField label="Inner Radius (mm)" paramKey="innerRadius" min={0.1} max={100} step={0.1} />
            <WasherParameterField label="Thickness (mm)" paramKey="thickness" min={0.2} max={30} step={0.05} />
            <WasherParameterField label="Chamfer Size (mm)" paramKey="chamferSize" min={0} max={6} step={0.05} />

            <label className="space-y-2">
              <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Washer Type</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={washerParameters.washerType}
                onChange={(event) =>
                  setWasherParameter("washerType", event.target.value as WasherParameters["washerType"])
                }
              >
                <option value="flat">Flat</option>
                <option value="spring">Spring</option>
                <option value="lock">Lock</option>
              </select>
            </label>
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Outer Ø</dt>
              <dd className="text-right text-cyan-300">{washerDimensions.outerDiameter.toFixed(3)}</dd>
              <dt>Inner Ø</dt>
              <dd className="text-right text-cyan-300">{washerDimensions.innerDiameter.toFixed(3)}</dd>
              <dt>Thickness</dt>
              <dd className="text-right text-cyan-300">{washerParameters.thickness.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType === "bracket" ? (
        <>
          <div className="space-y-4">
            <BracketParameterField label="Width (mm)" paramKey="width" min={2} max={240} step={0.5} />
            <BracketParameterField label="Height (mm)" paramKey="height" min={2} max={240} step={0.5} />
            <BracketParameterField label="Depth (mm)" paramKey="depth" min={2} max={240} step={0.5} />
            <BracketParameterField label="Thickness (mm)" paramKey="thickness" min={0.5} max={40} step={0.1} />
            <BracketParameterField label="Hole Radius (mm)" paramKey="holeRadius" min={0} max={30} step={0.1} />
            <BracketParameterField label="Hole Count" paramKey="holeCount" min={0} max={24} step={1} />
            <BracketParameterField label="Fillet Radius (mm)" paramKey="filletRadius" min={0} max={10} step={0.1} />

            <label className="space-y-2">
              <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">Bracket Type</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={bracketParameters.bracketType}
                onChange={(event) =>
                  setBracketParameter(
                    "bracketType",
                    event.target.value as BracketParameters["bracketType"]
                  )
                }
              >
                <option value="l_bracket">L Bracket</option>
                <option value="flat_plate">Flat Plate</option>
              </select>
            </label>
          </div>

          <div className="mt-6 rounded border border-slate-800 bg-slate-950/70 p-3">
            <p className="mb-2 text-xs tracking-[0.16em] text-slate-400 uppercase">Derived Dimensions</p>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <dt>Width</dt>
              <dd className="text-right text-cyan-300">{bracketParameters.width.toFixed(3)}</dd>
              <dt>Height</dt>
              <dd className="text-right text-cyan-300">{bracketParameters.height.toFixed(3)}</dd>
              <dt>Depth</dt>
              <dd className="text-right text-cyan-300">{bracketParameters.depth.toFixed(3)}</dd>
              <dt>Thickness</dt>
              <dd className="text-right text-cyan-300">{bracketParameters.thickness.toFixed(3)}</dd>
              <dt>Hole Ø</dt>
              <dd className="text-right text-cyan-300">{bracketDimensions.holeDiameter.toFixed(3)}</dd>
            </dl>
          </div>
        </>
      ) : null}

      {partType !== "gear" &&
      partType !== "shaft" &&
      partType !== "pulley" &&
      partType !== "bolt" &&
      partType !== "nut" &&
      partType !== "washer" &&
      partType !== "bracket" ? (
        <PartPlaceholderCard partType={partType} />
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          type="button"
          onClick={resetCurrentPart}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
        >
          Reset Part
        </button>
        <button
          type="button"
          onClick={onExportStl}
          className="rounded border border-cyan-600 bg-cyan-700/90 px-3 py-2 text-sm font-medium text-cyan-50 transition hover:bg-cyan-600"
        >
          Export STL
        </button>
      </div>
    </aside>
  );
}
