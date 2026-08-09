import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PencilTool } from '../canvas/tools/PencilTool';
import { Scene, ShapeType } from '../canvas/scene';
import { ToolContext } from '../canvas/tools/Tool';

// Mock Zustand
vi.mock('@draw/stores/editor', () => ({
  useEditorStore: {
    getState: () => ({ setUndoRedoAvailability: vi.fn() }),
  },
}));

// helpers

function makeCtx(scene: Scene): ToolContext {
  const history = {
    push: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
  };

  return {
    scene,
    camera: {} as never,
    invalidate: vi.fn(),
    setSelectedShapeIds: vi.fn(),
    getSelectedShapeIds: () => [],
    setSelectionBox: vi.fn(),
    setActiveTool: vi.fn(),
    history: history as never,
  };
}

function makeEvent(x: number, y: number) {
  return {
    worldX: x,
    worldY: y,
    screenX: x,
    screenY: y,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    pointerId: 1,
    button: 0,
  };
}

// tests

describe('PencilTool', () => {
  let tool: PencilTool;
  let scene: Scene;
  let ctx: ToolContext;

  beforeEach(() => {
    tool = new PencilTool();
    scene = new Scene();
    ctx = makeCtx(scene);
  });

  it('has name "pencil"', () => {
    expect(tool.name).toBe('pencil');
  });

  it('adds a live-preview shape on pointer down', () => {
    tool.onPointerDown(makeEvent(10, 20), ctx);

    const shapes = scene.getAllShapes();
    expect(shapes).toHaveLength(1);
    expect(shapes[0]!.type).toBe(ShapeType.Pencil);
  });

  it('accumulates points on pointer move', () => {
    tool.onPointerDown(makeEvent(0, 0), ctx);
    tool.onPointerMove(makeEvent(5, 5), ctx);
    tool.onPointerMove(makeEvent(10, 10), ctx);

    const shape = scene.getAllShapes()[0];
    expect(shape?.type).toBe(ShapeType.Pencil);
    if (shape?.type === ShapeType.Pencil) {
      expect(shape.points.length).toBe(3);
    }
  });

  it('commits through History and keeps pencil tool active on pointer up', () => {
    tool.onPointerDown(makeEvent(0, 0), ctx);
    tool.onPointerMove(makeEvent(10, 10), ctx);
    tool.onPointerUp(makeEvent(20, 20), ctx);

    expect(ctx.history.push).toHaveBeenCalledOnce();
    expect(ctx.setActiveTool).not.toHaveBeenCalled();
  });

  it('discards near-empty strokes (< 2 points) without pushing to History', () => {
    tool.onPointerDown(makeEvent(0, 0), ctx);
    tool.onPointerUp(makeEvent(0, 0), ctx);

    expect(ctx.history.push).not.toHaveBeenCalled();
    expect(scene.getAllShapes()).toHaveLength(0);
  });

  it('derives a correct bounding box on commit', () => {
    tool.onPointerDown(makeEvent(10, 20), ctx);
    tool.onPointerMove(makeEvent(30, 5), ctx);
    tool.onPointerUp(makeEvent(50, 40), ctx);

    const shapes = scene.getAllShapes();
    expect(shapes).toHaveLength(1);
    const shape = shapes[0];
    if (shape?.type === ShapeType.Pencil) {
      expect(shape.x).toBe(10);
      expect(shape.y).toBe(5);
      expect(shape.width).toBe(20);
      expect(shape.height).toBe(15);
    }
  });

  it('completed stroke is present in scene (undoable via History)', () => {
    tool.onPointerDown(makeEvent(0, 0), ctx);
    tool.onPointerMove(makeEvent(15, 15), ctx);
    tool.onPointerUp(makeEvent(30, 30), ctx);

    const shapes = scene.getAllShapes();
    expect(shapes).toHaveLength(1);
    expect(shapes[0]!.type).toBe(ShapeType.Pencil);

    const [before, after] = (ctx.history.push as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(before).toEqual([]);
    expect(after).toHaveLength(1);
    expect(after[0].type).toBe(ShapeType.Pencil);
  });
});
