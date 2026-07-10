import { Scene } from '../scene';
import { Rectangle, ShapeType } from '../scene';

export class Canvas2DRenderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly scene: Scene,
  ) {}

  public render(): void {
    this.beginFrame();

    this.clear();

    this.renderScene();

    this.renderOverlay();

    this.endFrame();
  }

  private beginFrame(): void {}

  private clear(): void {
    const { canvas } = this.ctx;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private renderScene(): void {
    for (const shape of this.scene.getShapes()) {
      switch (shape.type) {
        case ShapeType.Rectangle:
          this.renderRectangle(shape);
          break;
      }
    }
  }

  private renderRectangle(rectangle: Rectangle): void {
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }

  private renderOverlay(): void {}

  private endFrame(): void {}
}
