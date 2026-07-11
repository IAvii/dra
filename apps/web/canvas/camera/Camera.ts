export class Camera {
  private positionX = 0;
  private positionY = 0;

  private zoom = 1;

  private viewportWidth = 0;
  private viewportHeight = 0;

  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public setPosition(x: number, y: number): void {
    this.positionX = x;
    this.positionY = y;
  }

  public translate(dx: number, dy: number): void {
    this.positionX += dx;
    this.positionY += dy;
  }

  public getState() {
    return {
      x: this.positionX,
      y: this.positionY,
      zoom: this.zoom,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };
  }
  public worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: x - this.positionX,
      y: y - this.positionY,
    };
  }

  public screenToWorld(x: number, y: number): { x: number; y: number } {
    return {
      x: x + this.positionX,
      y: y + this.positionY,
    };
  }
}
