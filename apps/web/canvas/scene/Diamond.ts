import { BaseShape, ShapeType } from './Shape';

export interface Diamond extends BaseShape {
  type: ShapeType.Diamond;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}
