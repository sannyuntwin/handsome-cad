"use client";

import { useCallback, useState } from "react";
import type { BufferGeometry } from "three";
import { GearSidebar } from "@/components/sidebar/GearSidebar";
import { CadViewport } from "@/components/viewport/CadViewport";
import { exportGeometryAsStl } from "@/lib/geometry/stlExport";
import { useGearStore } from "@/store/gearStore";

export default function Home() {
  const partType = useGearStore((state) => state.partType);
  const gearParameters = useGearStore((state) => state.gearParameters);
  const [latestGeometry, setLatestGeometry] = useState<BufferGeometry | null>(null);

  const handleExportStl = useCallback(() => {
    if (!latestGeometry) {
      return;
    }

    const filename =
      partType === "gear"
        ? `${gearParameters.gearType}-gear-z${gearParameters.teethCount}.stl`
        : `${partType}.stl`;

    exportGeometryAsStl(latestGeometry, filename);
  }, [gearParameters.gearType, gearParameters.teethCount, latestGeometry, partType]);

  return (
    <main className="cad-shell sw-theme flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 md:flex-row">
      <GearSidebar onExportStl={handleExportStl} />
      <section className="relative min-h-0 flex-1">
        <CadViewport onGeometryChange={setLatestGeometry} />
      </section>
    </main>
  );
}
