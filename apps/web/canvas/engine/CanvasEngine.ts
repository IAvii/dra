import { getDevicePixelRatio } from '../utils';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';
import { Scene, ShapeType } from '../scene';
import { Camera } from '../camera';
import { InputController } from '../input';

export class CanvasEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Canvas2DRenderer;
  private frameId: number | null = null;
  private framePending = false;
  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly input: InputController;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.createContext();
    this.scene = new Scene();
    this.camera = new Camera();

    this.input = new InputController(this.canvas, this.camera, this.invalidate);

    this.renderer = new Canvas2DRenderer(this.ctx);

    this.scene.addShape({
      id: crypto.randomUUID(),
      type: ShapeType.Rectangle,
      x: 100,
      y: 100,
      width: 200,
      height: 120,
    });
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
    this.input.attach();
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

    this.camera.setViewport(width, height);

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.invalidate();
  };

  public invalidate(): void {
    if (this.framePending) {
      return;
    }

    this.framePending = true;

    this.frameId = requestAnimationFrame(() => {
      this.framePending = false;
      this.frameId = null;

      this.renderer.render(this.scene, this.camera);
    });
  }

  public destroy(): void {
    this.unregisterEventListeners();

    this.input.detach();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      this.framePending = false;
    }
  }
}
