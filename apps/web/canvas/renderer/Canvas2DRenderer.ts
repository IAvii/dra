import { Camera } from '../camera';
import { Scene } from '../scene';
import { Rectangle, ShapeType } from '../scene';

export class Canvas2DRenderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  public render(scene: Scene, camera: Camera): void {
    this.beginFrame();

    this.clear();

    this.applyCameraTransform(camera);

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

  private applyCameraTransform(camera: Camera): void {
    const { x, y } = camera.getState();

    this.ctx.save();

    this.ctx.translate(-x, -y);
    this.ctx.scale(camera.getZoom(), camera.getZoom());
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
