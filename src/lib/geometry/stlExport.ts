import { Mesh, MeshStandardMaterial } from "three";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import type { BufferGeometry } from "three";

export function exportGeometryAsStl(geometry: BufferGeometry, filename = "spur-gear.stl"): void {
  const exporter = new STLExporter();
  const mesh = new Mesh(geometry, new MeshStandardMaterial());
  const stlData = exporter.parse(mesh, { binary: true });

  const blob = new Blob([stlData], { type: "model/stl" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
