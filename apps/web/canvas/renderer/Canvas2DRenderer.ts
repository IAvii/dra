import { Scene } from '../scene';
import { Rectangle, Ellipse, Diamond, Line, Arrow, ShapeType } from '../scene';
import { Camera } from '../camera';

export class Canvas2DRenderer {
  private static readonly GRID_SIZE = 50;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly camera: Camera,
  ) {}

  public render(
    scene: Scene,
    camera: Camera,
    selectionOverlay?: {
      selectedShapeIds: readonly string[];
      selectionBox?: { x: number; y: number; width: number; height: number } | null;
    },
  ): void {
    this.beginFrame();
    this.clear();
    this.applyCameraTransform();
    this.renderGrid(camera);
    this.renderScene(scene);

    if (selectionOverlay?.selectedShapeIds && selectionOverlay.selectedShapeIds.length > 0) {
      this.renderSelectedShapeBounds(scene, selectionOverlay.selectedShapeIds);
    }

    this.resetTransform();

    if (selectionOverlay?.selectionBox) {
      this.renderMarqueeBox(selectionOverlay.selectionBox);
    }

    this.renderOverlay();
    this.endFrame();
  }

  private beginFrame(): void {}

  private clear(): void {
    const { width, height } = this.ctx.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
  }

  private applyCameraTransform(): void {
    const { x, y } = this.camera.getState();
    this.ctx.save();
    this.ctx.scale(this.camera.getZoom(), this.camera.getZoom());
    this.ctx.translate(-x, -y);
  }

  private renderGrid(camera: Camera): void {
    const zoom = camera.getZoom();
    let gridSize = Canvas2DRenderer.GRID_SIZE;

    while (gridSize * zoom < 25) {
      gridSize *= 2;
    }
    while (gridSize * zoom > 100) {
      gridSize /= 2;
    }

    const { viewportWidth, viewportHeight } = camera.getState();
    const topLeft = camera.screenToWorld(0, 0);
    const bottomRight = camera.screenToWorld(viewportWidth, viewportHeight);

    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;

    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1 / zoom;

    this.ctx.beginPath();
    for (let x = startX; x <= bottomRight.x; x += gridSize) {
      this.ctx.moveTo(x, topLeft.y);
      this.ctx.lineTo(x, bottomRight.y);
    }

    for (let y = startY; y <= bottomRight.y; y += gridSize) {
      this.ctx.moveTo(topLeft.x, y);
      this.ctx.lineTo(bottomRight.x, y);
    }
    this.ctx.stroke();
  }

  private resetTransform(): void {
    this.ctx.restore();
  }

  private renderScene(scene: Scene): void {
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'transparent';

    for (const shape of scene.getAllShapes()) {
      switch (shape.type) {
        case ShapeType.Rectangle:
          this.renderRectangle(shape);
          break;
        case ShapeType.Ellipse:
          this.renderEllipse(shape);
          break;
        case ShapeType.Diamond:
          this.renderDiamond(shape);
          break;
        case ShapeType.Line:
          this.renderLine(shape);
          break;
        case ShapeType.Arrow:
          this.renderArrow(shape);
          break;
      }
    }
  }

  private renderRectangle(rectangle: Rectangle): void {
    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }

  private renderEllipse(ellipse: Ellipse): void {
    const rx = Math.abs(ellipse.width) / 2;
    const ry = Math.abs(ellipse.height) / 2;
    const cx = ellipse.x + ellipse.width / 2;
    const cy = ellipse.y + ellipse.height / 2;

    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, ry, ellipse.rotation ?? 0, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  private renderDiamond(diamond: Diamond): void {
    const cx = diamond.x + diamond.width / 2;
    const cy = diamond.y + diamond.height / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, diamond.y);
    this.ctx.lineTo(diamond.x + diamond.width, cy);
    this.ctx.lineTo(cx, diamond.y + diamond.height);
    this.ctx.lineTo(diamond.x, cy);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private renderLine(line: Line): void {
    if (!line.points || line.points.length < 2) return;
    const p0 = line.points[0];
    if (!p0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(line.x + p0[0], line.y + p0[1]);
    for (let i = 1; i < line.points.length; i++) {
      const pt = line.points[i];
      if (pt) {
        this.ctx.lineTo(line.x + pt[0], line.y + pt[1]);
      }
    }
    this.ctx.stroke();
  }

  private renderArrow(arrow: Arrow): void {
    if (!arrow.points || arrow.points.length < 2) return;
    const p0 = arrow.points[0];
    const lastIdx = arrow.points.length - 1;
    const pLast = arrow.points[lastIdx];
    if (!p0 || !pLast) return;

    const startX = arrow.x + p0[0];
    const startY = arrow.y + p0[1];
    const endX = arrow.x + pLast[0];
    const endY = arrow.y + pLast[1];

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 12 / this.camera.getZoom();

    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6),
    );
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6),
    );
    this.ctx.stroke();
  }

  private renderSelectedShapeBounds(scene: Scene, selectedShapeIds: readonly string[]): void {
    const zoom = this.camera.getZoom();
    const handleSize = 8 / zoom;
    const handleHalf = handleSize / 2;

    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 1.5 / zoom;
    this.ctx.fillStyle = '#ffffff';

    for (const id of selectedShapeIds) {
      const shape = scene.getShapeById(id);
      if (!shape) continue;

      const minX = Math.min(shape.x, shape.x + shape.width);
      const minY = Math.min(shape.y, shape.y + shape.height);
      const width = Math.abs(shape.width);
      const height = Math.abs(shape.height);

      this.ctx.strokeRect(minX, minY, width, height);

      const points = [
        { x: minX, y: minY },
        { x: minX + width / 2, y: minY },
        { x: minX + width, y: minY },
        { x: minX + width, y: minY + height / 2 },
        { x: minX + width, y: minY + height },
        { x: minX + width / 2, y: minY + height },
        { x: minX, y: minY + height },
        { x: minX, y: minY + height / 2 },
      ];

      for (const pt of points) {
        this.ctx.fillRect(pt.x - handleHalf, pt.y - handleHalf, handleSize, handleSize);
        this.ctx.strokeRect(pt.x - handleHalf, pt.y - handleHalf, handleSize, handleSize);
      }

      const rotY = minY - 20 / zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(minX + width / 2, minY);
      this.ctx.lineTo(minX + width / 2, rotY);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(minX + width / 2, rotY, handleHalf, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  private renderMarqueeBox(box: { x: number; y: number; width: number; height: number }): void {
    const { x, y } = this.camera.worldToScreen(box.x, box.y);
    const zoom = this.camera.getZoom();
    const w = box.width * zoom;
    const h = box.height * zoom;

    this.ctx.save();
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);

    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();
  }

  private renderOverlay(): void {}

  private endFrame(): void {}
}
