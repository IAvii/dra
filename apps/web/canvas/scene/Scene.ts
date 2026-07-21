import { Bounds } from './bounds';
import type { Shape } from './Shape';

export class Scene {
  private readonly shapes: Shape[] = [];

  public addShape(shape: Shape): void {
    this.shapes.push(shape);
  }

  public removeShape(id: string): void {
    const index = this.shapes.findIndex((shape) => shape.id === id);

    if (index !== -1) {
      this.shapes.splice(index, 1);
    }
  }

  public getBounds(): Bounds | null {
    if (this.shapes.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const shape of this.shapes) {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
    };
  }

  public getAllShapes(): readonly Shape[] {
    return this.shapes;
  }
}
