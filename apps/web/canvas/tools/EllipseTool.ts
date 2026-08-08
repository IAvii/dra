import { Tool, ToolContext, ToolPointerEvent } from './Tool';
import { ShapeType, Ellipse } from '../scene';

export class EllipseTool implements Tool {
  public readonly name = 'ellipse';
  private currentShapeId: string | null = null;
  private startX = 0;
  private startY = 0;

  public onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void {
    this.startX = event.worldX;
    this.startY = event.worldY;

    const id = crypto.randomUUID();
    this.currentShapeId = id;

    const newEllipse: Ellipse = {
      id,
      type: ShapeType.Ellipse,
      x: event.worldX,
      y: event.worldY,
      width: 0,
      height: 0,
    };

    ctx.scene.addShape(newEllipse);
    ctx.setSelectedShapeIds([id]);
    ctx.invalidate();
  }

  public onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.currentShapeId) return;

    let width = event.worldX - this.startX;
    let height = event.worldY - this.startY;

    if (event.shiftKey) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }

    const x = width < 0 ? this.startX + width : this.startX;
    const y = height < 0 ? this.startY + height : this.startY;
    const absWidth = Math.abs(width);
    const absHeight = Math.abs(height);

    const shape = ctx.scene.getShapeById(this.currentShapeId);
    if (shape && shape.type === ShapeType.Ellipse) {
      ctx.scene.updateShape({
        ...shape,
        x,
        y,
        width: absWidth,
        height: absHeight,
      });
      ctx.invalidate();
    }
  }

  public onPointerUp(event: ToolPointerEvent, ctx: ToolContext): void {
    if (this.currentShapeId) {
      const shape = ctx.scene.getShapeById(this.currentShapeId);
      if (shape && shape.width < 2 && shape.height < 2) {
        ctx.scene.removeShape(this.currentShapeId);
        ctx.setSelectedShapeIds([]);
      }
    }
    this.currentShapeId = null;
    ctx.setActiveTool('select');
    ctx.invalidate();
  }
}
