import { BaseShape, ShapeType } from './Shape';

export interface Pencil extends BaseShape {
  type: ShapeType.Pencil;
  /** World-space points accumulated during drawing. */
  points: ReadonlyArray<[number, number]>;
  x: number;
  y: number;
  width: number;
  height: number;
}
