export class Canvas2DRenderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

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

  private renderScene(): void {}

  private renderOverlay(): void {}

  private endFrame(): void {}
}
