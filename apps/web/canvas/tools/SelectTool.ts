import { Tool, ToolContext, ToolPointerEvent } from './Tool';
import { Shape } from '../scene';

type TransformMode =
  | 'none'
  | 'move'
  | 'marquee'
  | 'rotate'
  | 'resize-tl'
  | 'resize-t'
  | 'resize-tr'
  | 'resize-r'
  | 'resize-br'
  | 'resize-b'
  | 'resize-bl'
  | 'resize-l';

export class SelectTool implements Tool {
  public readonly name = 'select';
  private mode: TransformMode = 'none';

  private startWorldX = 0;
  private startWorldY = 0;

  private marqueeStartX = 0;
  private marqueeStartY = 0;

  private initialShapeSnapshots: Map<string, Shape> = new Map();

  public onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void {
    this.startWorldX = event.worldX;
    this.startWorldY = event.worldY;

    const selectedIds = ctx.getSelectedShapeIds();
    const zoom = ctx.camera.getZoom();

    // 1. Check transform handles if single selected shape
    if (selectedIds.length === 1 && selectedIds[0]) {
      const selectedShape = ctx.scene.getShapeById(selectedIds[0]);
      if (selectedShape) {
        const handleHit = this.hitTestHandle(selectedShape, event.worldX, event.worldY, zoom);
        if (handleHit) {
          this.mode = handleHit;
          this.snapshotSelectedShapes(ctx);
          return;
        }
      }
    }

    // 2. Hit test shapes in scene
    const hitShape = this.hitTestShapes(ctx, event.worldX, event.worldY);

    if (hitShape) {
      if (event.shiftKey) {
        if (selectedIds.includes(hitShape.id)) {
          ctx.setSelectedShapeIds(selectedIds.filter((id) => id !== hitShape.id));
        } else {
          ctx.setSelectedShapeIds([...selectedIds, hitShape.id]);
        }
      } else {
        if (!selectedIds.includes(hitShape.id)) {
          ctx.setSelectedShapeIds([hitShape.id]);
        }
      }
      this.mode = 'move';
      this.snapshotSelectedShapes(ctx);
    } else {
      if (!event.shiftKey) {
        ctx.setSelectedShapeIds([]);
      }
      this.mode = 'marquee';
      this.marqueeStartX = event.worldX;
      this.marqueeStartY = event.worldY;
      ctx.setSelectionBox({
        x: event.worldX,
        y: event.worldY,
        width: 0,
        height: 0,
      });
    }

    ctx.invalidate();
  }

  public onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void {
    if (this.mode === 'none') return;

    const dx = event.worldX - this.startWorldX;
    const dy = event.worldY - this.startWorldY;

    if (this.mode === 'move') {
      for (const initialShape of this.initialShapeSnapshots.values()) {
        const updated: Shape = {
          ...initialShape,
          x: initialShape.x + dx,
          y: initialShape.y + dy,
        };
        ctx.scene.updateShape(updated);
      }
      ctx.invalidate();
    } else if (this.mode === 'marquee') {
      const minX = Math.min(this.marqueeStartX, event.worldX);
      const minY = Math.min(this.marqueeStartY, event.worldY);
      const width = Math.abs(event.worldX - this.marqueeStartX);
      const height = Math.abs(event.worldY - this.marqueeStartY);

      ctx.setSelectionBox({ x: minX, y: minY, width, height });

      const intersectingIds: string[] = [];
      for (const shape of ctx.scene.getAllShapes()) {
        if (
          shape.x < minX + width &&
          shape.x + shape.width > minX &&
          shape.y < minY + height &&
          shape.y + shape.height > minY
        ) {
          intersectingIds.push(shape.id);
        }
      }
      ctx.setSelectedShapeIds(intersectingIds);
      ctx.invalidate();
    } else if (this.mode.startsWith('resize-')) {
      const selectedIds = ctx.getSelectedShapeIds();
      if (selectedIds.length === 1 && selectedIds[0]) {
        const initial = this.initialShapeSnapshots.get(selectedIds[0]);
        if (initial) {
          this.handleResize(this.mode, initial, dx, dy, ctx);
        }
      }
    } else if (this.mode === 'rotate') {
      const selectedIds = ctx.getSelectedShapeIds();
      if (selectedIds.length === 1 && selectedIds[0]) {
        const initial = this.initialShapeSnapshots.get(selectedIds[0]);
        if (initial) {
          const cx = initial.x + initial.width / 2;
          const cy = initial.y + initial.height / 2;
          const angle = Math.atan2(event.worldY - cy, event.worldX - cx);
          const rotation = angle + Math.PI / 2;

          ctx.scene.updateShape({
            ...initial,
            rotation,
          });
          ctx.invalidate();
        }
      }
    }
  }

  public onPointerUp(_event: ToolPointerEvent, ctx: ToolContext): void {
    if (this.mode !== 'none' && this.mode !== 'marquee') {
      const before: Shape[] = [];
      const after: Shape[] = [];

      for (const [id, initialShape] of this.initialShapeSnapshots.entries()) {
        const currentShape = ctx.scene.getShapeById(id);
        if (currentShape && JSON.stringify(initialShape) !== JSON.stringify(currentShape)) {
          before.push(initialShape);
          after.push({ ...currentShape });
        }
      }

      if (before.length > 0) {
        ctx.history.push(before, after);
      }
    }

    this.mode = 'none';
    this.initialShapeSnapshots.clear();
    ctx.setSelectionBox(null);
    ctx.invalidate();
  }

  private snapshotSelectedShapes(ctx: ToolContext): void {
    this.initialShapeSnapshots.clear();
    for (const id of ctx.getSelectedShapeIds()) {
      const shape = ctx.scene.getShapeById(id);
      if (shape) {
        this.initialShapeSnapshots.set(id, { ...shape });
      }
    }
  }

  private hitTestShapes(ctx: ToolContext, worldX: number, worldY: number): Shape | undefined {
    const shapes = ctx.scene.getAllShapes();
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (
        s &&
        worldX >= s.x &&
        worldX <= s.x + s.width &&
        worldY >= s.y &&
        worldY <= s.y + s.height
      ) {
        return s;
      }
    }
    return undefined;
  }

  private hitTestHandle(
    shape: Shape,
    worldX: number,
    worldY: number,
    zoom: number,
  ): TransformMode | null {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const w = Math.abs(shape.width);
    const h = Math.abs(shape.height);
    const hitThreshold = 10 / zoom;

    const handles: { mode: TransformMode; x: number; y: number }[] = [
      { mode: 'resize-tl', x: minX, y: minY },
      { mode: 'resize-t', x: minX + w / 2, y: minY },
      { mode: 'resize-tr', x: minX + w, y: minY },
      { mode: 'resize-r', x: minX + w, y: minY + h / 2 },
      { mode: 'resize-br', x: minX + w, y: minY + h },
      { mode: 'resize-b', x: minX + w / 2, y: minY + h },
      { mode: 'resize-bl', x: minX, y: minY + h },
      { mode: 'resize-l', x: minX, y: minY + h / 2 },
      { mode: 'rotate', x: minX + w / 2, y: minY - 20 / zoom },
    ];

    for (const handle of handles) {
      if (Math.hypot(worldX - handle.x, worldY - handle.y) <= hitThreshold) {
        return handle.mode;
      }
    }
    return null;
  }

  private handleResize(
    mode: TransformMode,
    initial: Shape,
    dx: number,
    dy: number,
    ctx: ToolContext,
  ): void {
    let newX = initial.x;
    let newY = initial.y;
    let newW = initial.width;
    let newH = initial.height;

    switch (mode) {
      case 'resize-br':
        newW = Math.max(10, initial.width + dx);
        newH = Math.max(10, initial.height + dy);
        break;
      case 'resize-r':
        newW = Math.max(10, initial.width + dx);
        break;
      case 'resize-b':
        newH = Math.max(10, initial.height + dy);
        break;
      case 'resize-tl':
        newW = Math.max(10, initial.width - dx);
        newH = Math.max(10, initial.height - dy);
        newX = initial.x + (initial.width - newW);
        newY = initial.y + (initial.height - newH);
        break;
      case 'resize-t':
        newH = Math.max(10, initial.height - dy);
        newY = initial.y + (initial.height - newH);
        break;
      case 'resize-l':
        newW = Math.max(10, initial.width - dx);
        newX = initial.x + (initial.width - newW);
        break;
      case 'resize-tr':
        newW = Math.max(10, initial.width + dx);
        newH = Math.max(10, initial.height - dy);
        newY = initial.y + (initial.height - newH);
        break;
      case 'resize-bl':
        newW = Math.max(10, initial.width - dx);
        newH = Math.max(10, initial.height + dy);
        newX = initial.x + (initial.width - newW);
        break;
    }

    ctx.scene.updateShape({
      ...initial,
      x: newX,
      y: newY,
      width: newW,
      height: newH,
    });
    ctx.invalidate();
  }
}
