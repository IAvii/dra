import { BaseShape, ShapeType } from './Shape';

export interface Rectangle extends BaseShape {
  type: ShapeType.Rectangle;

  x: number;
  y: number;
  width: number;
  height: number;
}
