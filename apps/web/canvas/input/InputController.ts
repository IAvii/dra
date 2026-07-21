import { Camera } from '../camera';

export class InputController {
  private isPanning = false;

  private lastPointerX = 0;
  private lastPointerY = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
    private readonly invalidate: () => void,
  ) {}

  public attach(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.canvas.addEventListener('lostpointercapture', this.handleLostPointerCapture);
    this.canvas.addEventListener('wheel', this.handleWheel, {
      passive: false,
    });
  }
  public detach(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('lostpointercapture', this.handleLostPointerCapture);
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }
  private handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();

    this.canvas.setPointerCapture(event.pointerId);
    this.isPanning = true;

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.isPanning) return;

    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    const zoom = this.camera.getZoom();
    /*TODO: Recheck if correct*/ this.camera.translate(-dx / zoom, -dy / zoom);

    this.invalidate();
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (!this.isPanning) {
      return;
    }

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
    this.isPanning = false;
  };

  private handleLostPointerCapture = (): void => {
    this.isPanning = false;
  };

  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault();

    if (event.ctrlKey) {
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

      this.camera.zoomAt(factor, event.offsetX, event.offsetY);
    } else {
      this.camera.translate(event.deltaX, event.deltaY);
    }

    this.invalidate();
  };
}
