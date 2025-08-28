import React from 'react';
import { 
  MousePointer, 
  Move, 
  Square, 
  Circle, 
  Type, 
  Ruler, 
  Eye, 
  EyeOff, 
  Layers, 
  Undo, 
  Redo,
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  Settings
} from 'lucide-react';

export type VTTTool = 
  | 'select' 
  | 'move' 
  | 'draw-rect' 
  | 'draw-circle' 
  | 'draw-line' 
  | 'text' 
  | 'measure' 
  | 'fog-reveal' 
  | 'fog-hide';

interface VTTToolbarProps {
  activeTool: VTTTool;
  onToolChange: (tool: VTTTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onSettings?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
}

interface ToolButton {
  id: VTTTool;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  group: 'selection' | 'drawing' | 'utility';
}

const TOOLS: ToolButton[] = [
  { id: 'select', icon: MousePointer, label: 'Выбор', group: 'selection' },
  { id: 'move', icon: Move, label: 'Перемещение', group: 'selection' },
  { id: 'draw-rect', icon: Square, label: 'Прямоугольник', group: 'drawing' },
  { id: 'draw-circle', icon: Circle, label: 'Круг', group: 'drawing' },
  { id: 'text', icon: Type, label: 'Текст', group: 'drawing' },
  { id: 'measure', icon: Ruler, label: 'Измерение', group: 'utility' },
  { id: 'fog-reveal', icon: Eye, label: 'Открыть туман', group: 'utility' },
  { id: 'fog-hide', icon: EyeOff, label: 'Скрыть туман', group: 'utility' },
];

export default function VTTToolbar({ 
  activeTool, 
  onToolChange, 
  onUndo,
  onRedo,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onCopy,
  onSettings,
  canUndo = false,
  canRedo = false,
  hasSelection = false
}: VTTToolbarProps) {
  const renderToolGroup = (groupName: string, tools: ToolButton[]) => (
    <div key={groupName} className="flex items-center gap-1 px-2 first:pl-0">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onToolChange(id)}
          className={`p-2 rounded-md transition-colors ${
            activeTool === id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );

  const groupedTools = TOOLS.reduce((acc, tool) => {
    if (!acc[tool.group]) acc[tool.group] = [];
    acc[tool.group].push(tool);
    return acc;
  }, {} as Record<string, ToolButton[]>);

  return (
    <div className="bg-background border-b border-border">
      <div className="flex items-center h-12 px-4">
        {/* Основные инструменты */}
        <div className="flex items-center divide-x divide-border">
          {renderToolGroup('Выбор', groupedTools.selection || [])}
          {renderToolGroup('Рисование', groupedTools.drawing || [])}
          {renderToolGroup('Утилиты', groupedTools.utility || [])}
        </div>

        {/* Разделитель */}
        <div className="mx-4 w-px h-6 bg-border" />

        {/* Действия */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Отменить"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Повторить"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Разделитель */}
        <div className="mx-4 w-px h-6 bg-border" />

        {/* Действия с выделением */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRotateLeft}
            disabled={!hasSelection}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Повернуть влево"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onRotateRight}
            disabled={!hasSelection}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Повернуть вправо"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={onCopy}
            disabled={!hasSelection}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Копировать"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Настройки и слои */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSettings}
            className="p-2 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Слои"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={onSettings}
            className="p-2 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Настройки"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}