import { Scene } from '../scene';
import { Rectangle, ShapeType } from '../scene';
import { Camera } from '../camera';
export class Canvas2DRenderer {
  private static readonly GRID_SIZE = 50;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly camera: Camera,
  ) {}

  public render(scene: Scene, camera: Camera): void {
    this.beginFrame();

    this.clear();

    this.applyCameraTransform();

    this.renderGrid(camera);

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

  private renderGrid(camera: Camera): void {
    const zoom = camera.getZoom();

    let gridSize = Canvas2DRenderer.GRID_SIZE;

    while (gridSize * zoom < 25) {
      gridSize *= 2;
    }

    while (gridSize * zoom > 100) {
      gridSize /= 2;
    }
    const { viewportWidth, viewportHeight } = camera.getState();

    const topLeft = camera.screenToWorld(0, 0);

    const bottomRight = camera.screenToWorld(viewportWidth, viewportHeight);

    const startX = Math.floor(topLeft.x / gridSize) * gridSize;

    const startY = Math.floor(topLeft.y / gridSize) * gridSize;

    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();

    for (let x = startX; x <= bottomRight.x; x += gridSize) {
      const alignedX = Math.round(x) + 0.5;
      this.ctx.moveTo(alignedX, topLeft.y);
      this.ctx.lineTo(alignedX, bottomRight.y);
    }

    for (let y = startY; y <= bottomRight.y; y += gridSize) {
      const alignedY = Math.round(y) + 0.5;

      this.ctx.moveTo(topLeft.x, alignedY);
      this.ctx.lineTo(bottomRight.x, alignedY);
    }

    this.ctx.stroke();
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
