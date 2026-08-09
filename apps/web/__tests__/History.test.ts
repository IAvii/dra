import { describe, it, expect, beforeEach } from 'vitest';
import { History } from '../canvas/engine/History';
import { Scene, Shape, ShapeType } from '../canvas/scene';

// Mock Zustand store since History calls useEditorStore
import { vi } from 'vitest';

vi.mock('@draw/stores/editor', () => {
  return {
    useEditorStore: {
      getState: () => ({
        setUndoRedoAvailability: vi.fn(),
      }),
    },
  };
});

describe('History', () => {
  let history: History;
  let scene: Scene;

  beforeEach(() => {
    history = new History();
    scene = new Scene();
  });

  const createShape = (id: string, x: number): Shape => ({
    id,
    type: ShapeType.Rectangle,
    x,
    y: 0,
    width: 10,
    height: 10,
  });

  it('push sets canUndo', () => {
    expect(history.canUndo).toBe(false);
    history.push([], [createShape('1', 10)]);
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('undo restores Scene state and sets canRedo', () => {
    const shape = createShape('1', 10);
    scene.addShape(shape);
    history.push([], [shape]);

    expect(scene.getAllShapes().length).toBe(1);

    history.undo(scene);

    expect(scene.getAllShapes().length).toBe(0);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);
  });

  it('redo restores forward state', () => {
    const shape = createShape('1', 10);
    scene.addShape(shape);
    history.push([], [shape]);

    history.undo(scene);
    expect(scene.getAllShapes().length).toBe(0);

    history.redo(scene);
    expect(scene.getAllShapes().length).toBe(1);
    expect(scene.getAllShapes()[0]?.id).toBe('1');
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('undo at bottom is a no-op', () => {
    history.undo(scene); // no-op
    expect(history.canUndo).toBe(false);
  });

  it('redo at top is a no-op', () => {
    history.push([], [createShape('1', 10)]);
    history.redo(scene); // no-op
    expect(history.canRedo).toBe(false);
  });

  it('push after undo truncates the redo stack', () => {
    history.push([], [createShape('1', 10)]);
    history.push([], [createShape('2', 20)]);

    history.undo(scene);
    expect(history.canRedo).toBe(true);

    // Now push a new state
    history.push([], [createShape('3', 30)]);

    expect(history.canRedo).toBe(false);

    // Total should be 2 states (1, then 3).
    history.undo(scene);
    history.undo(scene);
    expect(history.canUndo).toBe(false); // Bottom reached
  });

  it('101st push drops the oldest entry and keeps stack length at 100', () => {
    for (let i = 0; i < 101; i++) {
      history.push([], [createShape(String(i), i)]);
    }

    expect(history.canUndo).toBe(true);

    // Undo 100 times should work, but the 101st won't be there.
    for (let i = 0; i < 100; i++) {
      history.undo(scene);
    }

    expect(history.canUndo).toBe(false);
  });
});
