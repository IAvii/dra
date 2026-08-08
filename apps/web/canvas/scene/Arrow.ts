import { BaseShape, ShapeType } from './Shape';

export interface Arrow extends BaseShape {
  type: ShapeType.Arrow;
  x: number;
  y: number;
  width: number;
  height: number;
  points: readonly [number, number][];
  rotation?: number;
}
