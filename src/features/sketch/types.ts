export type SketchMode = "view" | "sketch";

export type SketchTool = "select" | "line" | "rectangle" | "circle";

export interface SketchPoint {
  x: number;
  y: number;
}

interface SketchEntityBase {
  id: string;
  type: "line" | "rectangle" | "circle";
}

export interface LineEntity extends SketchEntityBase {
  type: "line";
  start: SketchPoint;
  end: SketchPoint;
}

export interface RectangleEntity extends SketchEntityBase {
  type: "rectangle";
  start: SketchPoint;
  end: SketchPoint;
}

export interface CircleEntity extends SketchEntityBase {
  type: "circle";
  center: SketchPoint;
  radius: number;
}

export type SketchEntity = LineEntity | RectangleEntity | CircleEntity;

export interface Sketch {
  id: string;
  name: string;
  plane: "XY";
  entities: SketchEntity[];
}

