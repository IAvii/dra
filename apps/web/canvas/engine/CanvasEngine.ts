import { getDevicePixelRatio } from '../utils';

export class CanvasEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.createContext();

    this.initialize();
  }

  private createContext(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to acquire 2D rendering ctx.');
    }

    return ctx;
  }

  private initialize(): void {
    this.resize();
    this.registerEventListeners();
  }

  private registerEventListeners(): void {
    window.addEventListener('resize', this.resize);
  }

  private unregisterEventListeners(): void {
    window.removeEventListener('resize', this.resize);
  }

  private resize = (): void => {
    const dpr = getDevicePixelRatio();

    const { width, height } = this.canvas.getBoundingClientRect();

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  public destroy(): void {
    this.unregisterEventListeners();
  }
}
