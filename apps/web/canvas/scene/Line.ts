import { BaseShape, ShapeType } from './Shape';

export interface Line extends BaseShape {
  type: ShapeType.Line;
  x: number;
  y: number;
  width: number;
  height: number;
  points: readonly [number, number][];
  rotation?: number;
}
