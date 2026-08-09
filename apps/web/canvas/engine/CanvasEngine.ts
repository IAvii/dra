import { getDevicePixelRatio } from '../utils';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';
import { Scene, ShapeType } from '../scene';
import { Camera } from '../camera';
import { InputController } from '../input';
import { ToolManager } from '../tools/ToolManager';
import { ToolContext } from '../tools/Tool';
import { useToolStore, ToolType } from '@draw/stores/tools';
import { History } from './History';

export class CanvasEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Canvas2DRenderer;
  private frameId: number | null = null;
  private framePending = false;
  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly input: InputController;
  private readonly toolManager: ToolManager;
  private readonly history: History;

  private selectedShapeIds: string[] = [];
  private selectionBox: { x: number; y: number; width: number; height: number } | null = null;

  private unsubscribeToolStore?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.createContext();
    this.scene = new Scene();
    this.camera = new Camera();
    this.camera.setZoom(1);

    this.toolManager = new ToolManager();
    this.history = new History();

    this.input = new InputController(
      this.canvas,
      this.camera,
      this.toolManager,
      this.history,
      this.getToolContext,
      this.invalidate,
    );
    this.renderer = new Canvas2DRenderer(this.ctx, this.camera);

    // Initial demo shape
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

  private getToolContext = (): ToolContext => {
    return {
      scene: this.scene,
      camera: this.camera,
      invalidate: this.invalidate,
      setSelectedShapeIds: (ids: string[]) => {
        this.selectedShapeIds = ids;
        this.invalidate();
      },
      getSelectedShapeIds: () => this.selectedShapeIds,
      setSelectionBox: (box) => {
        this.selectionBox = box;
        this.invalidate();
      },
      setActiveTool: (tool: ToolType) => {
        useToolStore.getState().setActiveTool(tool);
      },
      history: this.history,
    };
  };

  private initialize(): void {
    this.resize();
    this.registerEventListeners();
    this.input.attach();

    // Sync Zustand tool store changes into ToolManager
    this.unsubscribeToolStore = useToolStore.subscribe((state) => {
      this.toolManager.setActiveTool(state.activeTool, this.getToolContext());
    });
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

  public fitToScreen(): void {
    const bounds = this.scene.getBounds();
    if (!bounds) return;
    this.camera.fitToBounds(bounds);
    this.invalidate();
  }

  public centerCanvas(): void {
    this.camera.centerCanvas();
    this.invalidate();
  }

  public resetZoom(): void {
    this.camera.resetZoom();
    this.invalidate();
  }

  public invalidate = (): void => {
    if (this.framePending) return;

    this.framePending = true;
    this.frameId = requestAnimationFrame(() => {
      this.framePending = false;
      this.frameId = null;

      this.renderer.render(this.scene, this.camera, {
        selectedShapeIds: this.selectedShapeIds,
        selectionBox: this.selectionBox,
      });
    });
  };

  public destroy(): void {
    this.unregisterEventListeners();
    if (this.unsubscribeToolStore) {
      this.unsubscribeToolStore();
    }
    this.input.detach();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      this.framePending = false;
    }
  }
}
