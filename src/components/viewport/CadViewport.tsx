"use client";

import { Edges, Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";
import type { BufferGeometry } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { AxisTriad } from "@/components/viewport/AxisTriad";
import { DimensionOverlay } from "@/components/viewport/DimensionOverlay";
import { ViewportToolbar } from "@/components/viewport/ViewportToolbar";
import { useExtrudeStore } from "@/features/extrude/extrudeStore";
import { createPartGeometry } from "@/lib/geometry/partGeometryFactory";
import type { PartGeometryInput } from "@/lib/geometry/partGeometryFactory";
import { createExtrudeGeometry, isExtrudableSketchEntity } from "@/lib/geometry/extrudeGeometry";
import { SketchRenderer } from "@/features/sketch/sketchRenderer";
import { useSketchStore } from "@/features/sketch/sketchStore";
import { useGearStore } from "@/store/gearStore";
import { useViewportStore } from "@/store/viewportStore";

const gearMaterial = new MeshStandardMaterial({
  color: "#b0b8c4",
  metalness: 0.74,
  roughness: 0.3
});

const extrudeMaterial = new MeshStandardMaterial({
  color: "#88a7c9",
  metalness: 0.62,
  roughness: 0.34
});

interface PartMeshProps {
  partInput: PartGeometryInput;
  onGeometryChange: (geometry: BufferGeometry) => void;
  showWireframe: boolean;
}

function PartMesh({ partInput, onGeometryChange, showWireframe }: PartMeshProps) {
  const { geometry, axisHalfLength } = useMemo(() => createPartGeometry(partInput), [partInput]);
  const keywayGeometry = useMemo(() => {
    if (partInput.partType !== "shaft" || !partInput.shaftParameters.showKeywayCut) {
      return null;
    }

    return new BoxGeometry(
      partInput.shaftParameters.keywayWidth,
      partInput.shaftParameters.keywayDepth,
      partInput.shaftParameters.length * 0.98
    );
  }, [partInput]);

  useEffect(() => {
    onGeometryChange(geometry);

    return () => {
      geometry.dispose();
      keywayGeometry?.dispose();
    };
  }, [geometry, keywayGeometry, onGeometryChange]);

  const keywayOffsetY = partInput.shaftParameters.radius - partInput.shaftParameters.keywayDepth / 2;

  return (
    <group>
      <mesh geometry={geometry} material={gearMaterial} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <Edges color="#101827" threshold={16} />
      </mesh>

      {showWireframe ? (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color="#67e8f9"
            wireframe
            transparent
            opacity={0.62}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ) : null}

      {partInput.partType === "shaft" && partInput.shaftParameters.showKeywayCut && keywayGeometry ? (
        <mesh geometry={keywayGeometry} position={[0, keywayOffsetY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#111827"
            roughness={0.58}
            metalness={0.25}
            transparent
            opacity={0.9}
          />
        </mesh>
      ) : null}

      <Line
        points={[
          [0, -axisHalfLength, 0],
          [0, axisHalfLength, 0]
        ]}
        color="#60a5fa"
        transparent
        opacity={0.9}
        lineWidth={1}
      />
    </group>
  );
}

interface ExtrudeMeshesProps {
  partType: PartGeometryInput["partType"];
}

function ExtrudeMeshes({ partType }: ExtrudeMeshesProps) {
  const activeSketch = useSketchStore((state) => state.activeSketch);
  const extrudeFeatures = useExtrudeStore((state) => state.extrudeFeatures);
  const selectedExtrudeFeatureId = useExtrudeStore((state) => state.selectedExtrudeFeatureId);

  const geometries = useMemo(() => {
    const entitiesById = new Map(activeSketch.entities.map((entity) => [entity.id, entity]));

    return extrudeFeatures
      .filter((feature) => feature.partType === partType && feature.sketchId === activeSketch.id)
      .map((feature) => {
        const entity = entitiesById.get(feature.entityId);
        if (!entity || !isExtrudableSketchEntity(entity)) {
          return null;
        }

        const geometry = createExtrudeGeometry(feature, entity);
        if (!geometry) {
          return null;
        }

        return {
          id: feature.id,
          geometry
        };
      })
      .filter((value): value is { id: string; geometry: BufferGeometry } => value !== null);
  }, [activeSketch.entities, activeSketch.id, extrudeFeatures, partType]);

  useEffect(() => {
    return () => {
      geometries.forEach((item) => item.geometry.dispose());
    };
  }, [geometries]);

  return (
    <group>
      {geometries.map((item) => (
        <mesh key={item.id} geometry={item.geometry} material={extrudeMaterial} castShadow receiveShadow>
          <Edges color={selectedExtrudeFeatureId === item.id ? "#f59e0b" : "#3c4f68"} threshold={16} />
        </mesh>
      ))}
    </group>
  );
}

function GridUnitLabels() {
  const markers = [-40, -20, 0, 20, 40];

  return (
    <group>
      {markers.map((value) => (
        <Html key={`grid-x-${value}`} position={[value, -9.9, 0]} center>
          <div className="pointer-events-none select-none rounded bg-slate-900/75 px-1 py-0.5 text-[10px] text-slate-400">
            X {value}
          </div>
        </Html>
      ))}
      {markers
        .filter((value) => value !== 0)
        .map((value) => (
          <Html key={`grid-z-${value}`} position={[0, -9.9, value]} center>
            <div className="pointer-events-none select-none rounded bg-slate-900/75 px-1 py-0.5 text-[10px] text-slate-400">
              Z {value}
            </div>
          </Html>
        ))}
    </group>
  );
}

interface CadViewportProps {
  onGeometryChange: (geometry: BufferGeometry) => void;
}

export function CadViewport({ onGeometryChange }: CadViewportProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cameraResetVersion = useViewportStore((state) => state.cameraResetVersion);
  const showWireframe = useViewportStore((state) => state.showWireframe);
  const sketchMode = useSketchStore((state) => state.sketchMode);

  const partType = useGearStore((state) => state.partType);
  const gearParameters = useGearStore((state) => state.gearParameters);
  const shaftParameters = useGearStore((state) => state.shaftParameters);
  const pulleyParameters = useGearStore((state) => state.pulleyParameters);
  const boltParameters = useGearStore((state) => state.boltParameters);
  const nutParameters = useGearStore((state) => state.nutParameters);
  const washerParameters = useGearStore((state) => state.washerParameters);
  const bracketParameters = useGearStore((state) => state.bracketParameters);

  const partInput = useMemo(
    () => ({
      partType,
      gearParameters,
      shaftParameters,
      pulleyParameters,
      boltParameters,
      nutParameters,
      washerParameters,
      bracketParameters
    }),
    [
      partType,
      gearParameters,
      shaftParameters,
      pulleyParameters,
      boltParameters,
      nutParameters,
      washerParameters,
      bracketParameters
    ]
  );

  useEffect(() => {
    controlsRef.current?.reset();
  }, [cameraResetVersion]);

  return (
    <div className="relative h-full w-full bg-[#d9dee6]">
      <ViewportToolbar />
      <DimensionOverlay
        partType={partType}
        gearParameters={gearParameters}
        shaftParameters={shaftParameters}
        pulleyParameters={pulleyParameters}
        boltParameters={boltParameters}
        nutParameters={nutParameters}
        washerParameters={washerParameters}
        bracketParameters={bracketParameters}
      />
      <Canvas
        shadows="soft"
        camera={{ position: [40, 28, 40], fov: 42, near: 0.1, far: 2000 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#d9dee6"]} />
        <fog attach="fog" args={["#d9dee6", 120, 320]} />

        <ambientLight intensity={0.65} />
        <hemisphereLight args={["#f7fbff", "#aeb7c5", 0.68]} />
        <directionalLight
          position={[34, 48, 18]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <gridHelper args={[240, 120, "#9aa8bb", "#bcc6d3"]} position={[0, -10, 0]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10.02, 0]} receiveShadow>
          <planeGeometry args={[240, 240]} />
          <shadowMaterial opacity={0.22} />
        </mesh>

        <PartMesh partInput={partInput} onGeometryChange={onGeometryChange} showWireframe={showWireframe} />
        <ExtrudeMeshes partType={partType} />
        <SketchRenderer />

        <GridUnitLabels />
        <AxisTriad />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          enableRotate={sketchMode === "view"}
          minDistance={12}
          maxDistance={220}
          maxPolarAngle={Math.PI * 0.495}
        />
      </Canvas>
    </div>
  );
}
