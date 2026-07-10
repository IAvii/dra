export enum ShapeType {
  Rectangle = 'rectangle',
  Ellipse = 'ellipse',
  Line = 'line',
  Arrow = 'arrow',
  Pencil = 'pencil',
  Text = 'text',
}

export interface BaseShape {
  id: string;
}

import type { Rectangle } from './Rectangle';

export type Shape = Rectangle;
