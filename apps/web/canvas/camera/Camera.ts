export class Camera {
  private positionX = 0;
  private positionY = 0;

  private zoom = 1;

  private viewportWidth = 0;
  private viewportHeight = 0;
  private static readonly MIN_ZOOM = 0.1;
  private static readonly MAX_ZOOM = 8;

  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public setPosition(x: number, y: number): void {
    this.positionX = x;
    this.positionY = y;
  }

  public setZoom(zoom: number): void {
    this.zoom = Math.min(Camera.MAX_ZOOM, Math.max(Camera.MIN_ZOOM, zoom));
  }

  public getZoom(): number {
    return this.zoom;
  }

  public zoomBy(factor: number): void {
    this.setZoom(this.zoom * factor);
  }

  public translate(dx: number, dy: number): void {
    this.positionX += dx;
    this.positionY += dy;
  }

  public getState(): Readonly<{
    x: number;
    y: number;
    zoom: number;
    viewportWidth: number;
    viewportHeight: number;
  }> {
    return {
      x: this.positionX,
      y: this.positionY,
      zoom: this.zoom,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };
  }

  public worldToScreen(x: number, y: number): { x: number; y: number } {
    const { x: cameraX, y: cameraY } = this.getState();
    const zoom = this.getZoom();

    return {
      x: (x - cameraX) * zoom,
      y: (y - cameraY) * zoom,
    };
  }

  public screenToWorld(x: number, y: number): { x: number; y: number } {
    const { x: cameraX, y: cameraY } = this.getState();
    const zoom = this.getZoom();

    return {
      x: x / zoom + cameraX,
      y: y / zoom + cameraY,
    };
  }

  public zoomAt(factor: number, screenX: number, screenY: number): void {
    const worldBefore = this.screenToWorld(screenX, screenY);

    this.zoomBy(factor);

    const worldAfter = this.screenToWorld(screenX, screenY);

    this.translate(worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }
}
