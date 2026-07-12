import { Scene } from '../scene';
import { Rectangle, ShapeType } from '../scene';
import { Camera } from '../camera';
export class Canvas2DRenderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly camera: Camera,
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
    const { x, y } = this.camera.getState();

    this.ctx.save();

    this.ctx.scale(this.camera.getZoom(), this.camera.getZoom());
    this.ctx.translate(-x, -y);
  }

  private resetTransform(): void {
    this.ctx.restore();
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
