import { Tool, ToolContext, ToolPointerEvent } from './Tool';
import { ShapeType, Pencil } from '../scene';

export class PencilTool implements Tool {
  public readonly name = 'pencil';

  /** Points accumulated during the current stroke (world coordinates). */
  private points: [number, number][] = [];
  private currentShapeId: string | null = null;

  public onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void {
    this.points = [[event.worldX, event.worldY]];
    const id = crypto.randomUUID();
    this.currentShapeId = id;

    // Add a live-preview shape immediately so the renderer can draw it.
    const shape: Pencil = {
      id,
      type: ShapeType.Pencil,
      points: [[event.worldX, event.worldY]],
      x: event.worldX,
      y: event.worldY,
      width: 0,
      height: 0,
    };

    ctx.scene.addShape(shape);
    ctx.invalidate();
  }

  public onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.currentShapeId) return;

    this.points.push([event.worldX, event.worldY]);

    const shape = ctx.scene.getShapeById(this.currentShapeId);
    if (!shape || shape.type !== ShapeType.Pencil) return;

    // Update the live-preview shape with the growing points array.
    const bbox = computeBoundingBox(this.points);
    ctx.scene.updateShape({
      ...shape,
      points: [...this.points],
      ...bbox,
    });

    ctx.invalidate();
  }

  public onPointerUp(_event: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.currentShapeId) return;

    const id = this.currentShapeId;
    this.currentShapeId = null;

    // Discard near-empty strokes.
    if (this.points.length < 2) {
      ctx.scene.removeShape(id);
      ctx.invalidate();
      this.points = [];
      return;
    }

    const shape = ctx.scene.getShapeById(id);
    if (shape && shape.type === ShapeType.Pencil) {
      const bbox = computeBoundingBox(this.points);
      const finalShape: Pencil = {
        ...shape,
        points: [...this.points] as ReadonlyArray<[number, number]>,
        ...bbox,
      };

      // Remove the live-preview then commit through History so the
      // before-state is truly empty for this shape.
      ctx.scene.removeShape(id);
      ctx.scene.addShape(finalShape);
      ctx.history.push([], [{ ...finalShape }]);
    }

    this.points = [];
    ctx.invalidate();
  }
}

/** Compute an axis-aligned bounding box from an array of world points. */
function computeBoundingBox(points: ReadonlyArray<[number, number]>): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [px, py] of points) {
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
