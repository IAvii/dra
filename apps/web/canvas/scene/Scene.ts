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

  public getAllShapes(): readonly Shape[] {
    return this.shapes;
  }
}
