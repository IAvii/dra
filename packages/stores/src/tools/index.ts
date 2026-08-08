import { create } from 'zustand';

export type ToolType = 'select' | 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow';

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
