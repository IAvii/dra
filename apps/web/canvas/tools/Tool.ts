import { Camera } from '../camera';
import { Scene } from '../scene';
import { ToolType } from '@draw/stores/tools';
import { History } from '../engine/History';
export interface ToolPointerEvent {
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  pointerId: number;
  button: number;
}

export interface ToolContext {
  scene: Scene;
  camera: Camera;
  invalidate: () => void;
  setSelectedShapeIds: (ids: string[]) => void;
  getSelectedShapeIds: () => readonly string[];
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void;
  setActiveTool: (tool: ToolType) => void;
  history: History;
}

export interface Tool {
  readonly name: string;
  onActivate?(ctx: ToolContext): void;
  onDeactivate?(ctx: ToolContext): void;
  onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void;
  onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void;
  onPointerUp(event: ToolPointerEvent, ctx: ToolContext): void;
}
