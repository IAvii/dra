import { Camera } from '../camera';
import { ToolManager } from '../tools/ToolManager';
import { ToolContext, ToolPointerEvent } from '../tools/Tool';
import { History } from '../engine/History';

export class InputController {
  private isMiddlePanning = false;
  private isSpacePanning = false;
  private isSpacePressed = false;

  private lastPointerX = 0;
  private lastPointerY = 0;

  // Touch gesture state
  private activePointers = new Map<number, { x: number; y: number }>();
  private initialPinchDist = 0;
  private initialZoom = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
    private readonly toolManager: ToolManager,
    private readonly history: History,
    private readonly getToolContext: () => ToolContext,
    private readonly invalidate: () => void,
  ) {}

  public attach(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.canvas.addEventListener('lostpointercapture', this.handleLostPointerCapture);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public detach(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('lostpointercapture', this.handleLostPointerCapture);
    this.canvas.removeEventListener('wheel', this.handleWheel);

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Handle 2-finger touch gesture start
    if (this.activePointers.size === 2) {
      const points = Array.from(this.activePointers.values());
      const p1 = points[0];
      const p2 = points[1];
      if (p1 && p2) {
        this.initialPinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.initialZoom = this.camera.getZoom();
      }
      return;
    }

    // Middle click pan OR Space+Click pan
    if (event.button === 1 || (event.button === 0 && this.isSpacePressed)) {
      event.preventDefault();
      this.canvas.setPointerCapture(event.pointerId);
      if (event.button === 1) this.isMiddlePanning = true;
      if (event.button === 0 && this.isSpacePressed) this.isSpacePanning = true;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
      return;
    }

    // Left click tool interaction
    if (event.button === 0) {
      this.canvas.setPointerCapture(event.pointerId);
      const rect = this.canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const world = this.camera.screenToWorld(screenX, screenY);

      const toolEvent: ToolPointerEvent = {
        worldX: world.x,
        worldY: world.y,
        screenX,
        screenY,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        pointerId: event.pointerId,
        button: event.button,
      };

      this.toolManager.onPointerDown(toolEvent, this.getToolContext());
    }
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (this.activePointers.has(event.pointerId)) {
      this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    // Handle 2-finger pinch & pan gesture
    if (this.activePointers.size === 2) {
      const points = Array.from(this.activePointers.values());
      const p1 = points[0];
      const p2 = points[1];
      if (p1 && p2) {
        const currentDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        if (this.initialPinchDist > 0) {
          const scaleFactor = currentDist / this.initialPinchDist;
          const targetZoom = this.initialZoom * scaleFactor;

          const rect = this.canvas.getBoundingClientRect();
          this.camera.zoomAt(targetZoom / this.camera.getZoom(), midX - rect.left, midY - rect.top);
          this.invalidate();
        }
      }
      return;
    }

    // Handle middle or space panning
    if (this.isMiddlePanning || this.isSpacePanning) {
      const dx = event.clientX - this.lastPointerX;
      const dy = event.clientY - this.lastPointerY;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;

      const zoom = this.camera.getZoom();
      this.camera.translate(-dx / zoom, -dy / zoom);
      this.invalidate();
      return;
    }

    // Left drag tool move
    const rect = this.canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.camera.screenToWorld(screenX, screenY);

    const toolEvent: ToolPointerEvent = {
      worldX: world.x,
      worldY: world.y,
      screenX,
      screenY,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      pointerId: event.pointerId,
      button: event.button,
    };

    this.toolManager.onPointerMove(toolEvent, this.getToolContext());
  };

  private handlePointerUp = (event: PointerEvent): void => {
    this.activePointers.delete(event.pointerId);

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    if (this.isMiddlePanning || this.isSpacePanning) {
      this.isMiddlePanning = false;
      this.isSpacePanning = false;
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.camera.screenToWorld(screenX, screenY);

    const toolEvent: ToolPointerEvent = {
      worldX: world.x,
      worldY: world.y,
      screenX,
      screenY,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      pointerId: event.pointerId,
      button: event.button,
    };

    this.toolManager.onPointerUp(toolEvent, this.getToolContext());
  };

  private handleLostPointerCapture = (): void => {
    this.isMiddlePanning = false;
    this.isSpacePanning = false;
  };

  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.camera.zoomAt(factor, event.offsetX, event.offsetY);
    } else {
      const zoom = this.camera.getZoom();
      this.camera.translate(event.deltaX / zoom, event.deltaY / zoom);
    }

    this.invalidate();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Space' && !this.isSpacePressed) {
      this.isSpacePressed = true;
    }

    // Keyboard shortcuts for Tools
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'v':
        case '1':
          this.getToolContext().setActiveTool('select');
          break;
        case 'r':
        case '2':
          this.getToolContext().setActiveTool('rectangle');
          break;
        case 'o':
        case 'e':
        case '3':
          this.getToolContext().setActiveTool('ellipse');
          break;
        case 'd':
        case '4':
          this.getToolContext().setActiveTool('diamond');
          break;
        case 'l':
        case '5':
          this.getToolContext().setActiveTool('line');
          break;
        case 'a':
        case '6':
          this.getToolContext().setActiveTool('arrow');
          break;
        case 'p':
          this.getToolContext().setActiveTool('pencil');
          break;
      }
    }

    // Center canvas & reset zoom shortcuts
    if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault();
      this.camera.resetZoom();
      this.invalidate();
    }
    if (event.shiftKey && event.key === '1') {
      event.preventDefault();
      this.camera.centerCanvas();
      this.invalidate();
    }

    // Undo / Redo
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          this.history.redo(this.getToolContext().scene);
        } else {
          this.history.undo(this.getToolContext().scene);
        }
        this.invalidate();
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        this.history.redo(this.getToolContext().scene);
        this.invalidate();
      }
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      this.isSpacePressed = false;
      this.isSpacePanning = false;
    }
  };
}
