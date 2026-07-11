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
  }
  public detach(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('lostpointercapture', this.handleLostPointerCapture);
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
    this.camera.translate(-dx, -dy);

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
}
