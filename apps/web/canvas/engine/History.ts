import { Scene, Shape } from '../scene';
import { useEditorStore } from '@draw/stores/editor';

interface HistoryEntry {
  before: Shape[];
  after: Shape[];
}

export class History {
  private stack: HistoryEntry[] = [];
  private currentIndex = -1;
  private readonly MAX_HISTORY = 100;

  public push(before: Shape[], after: Shape[]): void {
    // Truncate redo stack if we push after undo
    this.stack = this.stack.slice(0, this.currentIndex + 1);

    // Deep copy isn't strictly necessary if tools are doing it,
    // but the shapes are plain objects and treated as immutable anyway
    this.stack.push({ before, after });

    if (this.stack.length > this.MAX_HISTORY) {
      this.stack.shift();
    } else {
      this.currentIndex++;
    }

    this.updateStore();
  }

  public undo(scene: Scene): void {
    if (!this.canUndo) return;

    const entry = this.stack[this.currentIndex];
    if (!entry) return;
    this.applyShapes(scene, entry.after, entry.before);

    this.currentIndex--;
    this.updateStore();
  }

  public redo(scene: Scene): void {
    if (!this.canRedo) return;

    this.currentIndex++;
    const entry = this.stack[this.currentIndex];
    if (!entry) return;
    this.applyShapes(scene, entry.before, entry.after);

    this.updateStore();
  }

  private applyShapes(scene: Scene, from: Shape[], to: Shape[]): void {
    for (const fromShape of from) {
      const existsInTo = to.some((s) => s.id === fromShape.id);
      if (!existsInTo) {
        scene.removeShape(fromShape.id);
      }
    }

    for (const toShape of to) {
      const existing = scene.getShapeById(toShape.id);
      if (existing) {
        scene.updateShape(toShape);
      } else {
        scene.addShape(toShape);
      }
    }
  }

  public get canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  public get canRedo(): boolean {
    return this.currentIndex < this.stack.length - 1;
  }

  private updateStore(): void {
    useEditorStore.getState().setUndoRedoAvailability(this.canUndo, this.canRedo);
  }
}
