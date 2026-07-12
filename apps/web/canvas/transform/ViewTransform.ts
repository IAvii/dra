import type { Camera } from '../camera';

export class ViewTransform {
  constructor(private readonly camera: Camera) {}

  public worldToScreen(x: number, y: number): { x: number; y: number } {
    const { x: cameraX, y: cameraY } = this.camera.getState();
    const zoom = this.camera.getZoom();

    return {
      x: (x - cameraX) * zoom,
      y: (y - cameraY) * zoom,
    };
  }

  public screenToWorld(x: number, y: number): { x: number; y: number } {
    const { x: cameraX, y: cameraY } = this.camera.getState();
    const zoom = this.camera.getZoom();

    return {
      x: x / zoom + cameraX,
      y: y / zoom + cameraY,
    };
  }

  public zoomAt(factor: number, screenX: number, screenY: number): void {
    const worldBefore = this.screenToWorld(screenX, screenY);

    this.camera.zoomBy(factor);

    const worldAfter = this.screenToWorld(screenX, screenY);

    this.camera.translate(worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }

  public restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.camera.getState();

    ctx.save();

    ctx.translate(-x, -y);
    ctx.scale(this.camera.getZoom(), this.camera.getZoom());
  }
}
