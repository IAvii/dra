import { BaseShape, ShapeType } from './Shape';

export interface Ellipse extends BaseShape {
  type: ShapeType.Ellipse;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}
