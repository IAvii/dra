import { Tool, ToolContext, ToolPointerEvent } from './Tool';
import { ShapeType, Line } from '../scene';

export class LineTool implements Tool {
  public readonly name = 'line';
  private currentShapeId: string | null = null;
  private startX = 0;
  private startY = 0;

  public onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void {
    this.startX = event.worldX;
    this.startY = event.worldY;

    const id = crypto.randomUUID();
    this.currentShapeId = id;

    const newLine: Line = {
      id,
      type: ShapeType.Line,
      x: event.worldX,
      y: event.worldY,
      width: 0,
      height: 0,
      points: [
        [0, 0],
        [0, 0],
      ],
    };

    ctx.scene.addShape(newLine);
    ctx.setSelectedShapeIds([id]);
    ctx.invalidate();
  }

  public onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.currentShapeId) return;

    let dx = event.worldX - this.startX;
    let dy = event.worldY - this.startY;

    if (event.shiftKey) {
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);
      const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      dx = Math.cos(snappedAngle) * dist;
      dy = Math.sin(snappedAngle) * dist;
    }

    const shape = ctx.scene.getShapeById(this.currentShapeId);
    if (shape && shape.type === ShapeType.Line) {
      ctx.scene.updateShape({
        ...shape,
        x: this.startX,
        y: this.startY,
        width: Math.abs(dx),
        height: Math.abs(dy),
        points: [
          [0, 0],
          [dx, dy],
        ],
      });
      ctx.invalidate();
    }
  }

  public onPointerUp(event: ToolPointerEvent, ctx: ToolContext): void {
    if (this.currentShapeId) {
      const shape = ctx.scene.getShapeById(this.currentShapeId);
      if (shape && shape.type === ShapeType.Line) {
        const p2 = shape.points[1];
        if (p2 && Math.hypot(p2[0], p2[1]) < 3) {
          ctx.scene.removeShape(this.currentShapeId);
          ctx.setSelectedShapeIds([]);
        } else {
          ctx.history.push([], [{ ...shape }]);
        }
      }
    }
    this.currentShapeId = null;
    ctx.setActiveTool('select');
    ctx.invalidate();
  }
}
