import { Tool, ToolContext, ToolPointerEvent } from './Tool';
import { SelectTool } from './SelectTool';
import { RectangleTool } from './RectangleTool';
import { EllipseTool } from './EllipseTool';
import { DiamondTool } from './DiamondTool';
import { LineTool } from './LineTool';
import { ArrowTool } from './ArrowTool';
import { ToolType } from '@draw/stores/tools';

export class ToolManager {
  private activeToolName: ToolType = 'select';
  private readonly tools: Map<ToolType, Tool> = new Map();

  constructor() {
    this.registerTool(new SelectTool());
    this.registerTool(new RectangleTool());
    this.registerTool(new EllipseTool());
    this.registerTool(new DiamondTool());
    this.registerTool(new LineTool());
    this.registerTool(new ArrowTool());
  }

  private registerTool(tool: Tool): void {
    this.tools.set(tool.name as ToolType, tool);
  }

  public getActiveTool(): Tool {
    return this.tools.get(this.activeToolName) || this.tools.get('select')!;
  }

  public setActiveTool(toolName: ToolType, ctx: ToolContext): void {
    if (this.activeToolName === toolName) return;

    const currentTool = this.getActiveTool();
    if (currentTool.onDeactivate) {
      currentTool.onDeactivate(ctx);
    }

    this.activeToolName = toolName;

    const newTool = this.getActiveTool();
    if (newTool.onActivate) {
      newTool.onActivate(ctx);
    }
  }

  public onPointerDown(event: ToolPointerEvent, ctx: ToolContext): void {
    this.getActiveTool().onPointerDown(event, ctx);
  }

  public onPointerMove(event: ToolPointerEvent, ctx: ToolContext): void {
    this.getActiveTool().onPointerMove(event, ctx);
  }

  public onPointerUp(event: ToolPointerEvent, ctx: ToolContext): void {
    this.getActiveTool().onPointerUp(event, ctx);
  }
}
