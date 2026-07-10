export class Camera {
  private x = 0;
  private y = 0;

  private zoom = 1;

  private viewportWidth = 0;
  private viewportHeight = 0;

  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public getState() {
    return {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };
  }
}
