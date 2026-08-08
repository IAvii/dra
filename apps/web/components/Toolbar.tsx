'use client';

import { useToolStore, ToolType } from '@draw/stores/tools';

interface ToolbarProps {
  onFitToScreen?: () => void;
  onResetZoom?: () => void;
  onCenterCanvas?: () => void;
}

const TOOLS: { id: ToolType; label: string; shortcut: string; icon: string }[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: '↖' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: '▭' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: '○' },
  { id: 'diamond', label: 'Diamond', shortcut: 'D', icon: '◇' },
  { id: 'line', label: 'Line', shortcut: 'L', icon: '╱' },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: '➔' },
];

export function Toolbar({ onFitToScreen, onResetZoom, onCenterCanvas }: ToolbarProps) {
  const activeTool = useToolStore((state: { activeTool: ToolType }) => state.activeTool);
  const setActiveTool = useToolStore(
    (state: { setActiveTool: (tool: ToolType) => void }) => state.setActiveTool,
  );

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 p-1.5 rounded-xl shadow-lg">
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              activeTool === tool.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{tool.icon}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 pl-1">
        {onFitToScreen && (
          <button
            onClick={onFitToScreen}
            title="Fit to Screen (Shift+1)"
            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fit Screen
          </button>
        )}
        {onResetZoom && (
          <button
            onClick={onResetZoom}
            title="Reset Zoom (Ctrl+0)"
            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            100%
          </button>
        )}
        {onCenterCanvas && (
          <button
            onClick={onCenterCanvas}
            title="Center Canvas"
            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Center
          </button>
        )}
      </div>
    </div>
  );
}
