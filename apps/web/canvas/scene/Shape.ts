import type { Rectangle } from './Rectangle';
import type { Ellipse } from './Ellipse';
import type { Diamond } from './Diamond';
import type { Line } from './Line';
import type { Arrow } from './Arrow';

export enum ShapeType {
  Rectangle = 'rectangle',
  Ellipse = 'ellipse',
  Diamond = 'diamond',
  Line = 'line',
  Arrow = 'arrow',
  Pencil = 'pencil',
  Text = 'text',
}

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export type Shape = Rectangle | Ellipse | Diamond | Line | Arrow;
