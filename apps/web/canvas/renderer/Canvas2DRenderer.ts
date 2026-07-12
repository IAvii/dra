import { Scene } from '../scene';
import { Rectangle, ShapeType } from '../scene';
import { ViewTransform } from '../transform';

export class Canvas2DRenderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly transform: ViewTransform,
  ) {}

  public render(scene: Scene): void {
    this.beginFrame();

    this.clear();

    this.applyCameraTransform();

    this.renderScene(scene);

    this.resetTransform();

    this.renderOverlay();

    this.endFrame();
  }

  private beginFrame(): void {}

  private clear(): void {
    const { width, height } = this.ctx.canvas.getBoundingClientRect();

    this.ctx.clearRect(0, 0, width, height);
  }

  private applyCameraTransform(): void {
    this.transform.apply(this.ctx);
  }

  private resetTransform(): void {
    this.transform.restore(this.ctx);
  }

  private renderScene(scene: Scene): void {
    for (const shape of scene.getAllShapes()) {
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
