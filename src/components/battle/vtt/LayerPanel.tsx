import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, MoreVertical, Plus } from 'lucide-react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  type: 'map' | 'tokens' | 'drawings' | 'fog' | 'background';
}

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisible: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerAdd: (type: Layer['type']) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerRename: (layerId: string, name: string) => void;
}

export default function LayerPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisible,
  onLayerToggleLock,
  onLayerOpacityChange,
  onLayerAdd,
  onLayerDelete,
  onLayerRename
}: LayerPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [newLayerName, setNewLayerName] = useState('');

  const handleRename = (layerId: string) => {
    if (newLayerName.trim()) {
      onLayerRename(layerId, newLayerName.trim());
    }
    setEditingLayerId(null);
    setNewLayerName('');
  };

  const startRename = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setNewLayerName(layer.name);
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'map': return '🗺️';
      case 'tokens': return '🎭';
      case 'drawings': return '✏️';
      case 'fog': return '🌫️';
      case 'background': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <div className="w-64 bg-background border-l border-border flex flex-col h-full">
      {/* Заголовок */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Слои</h3>
          <div className="relative group">
            <button className="p-1 hover:bg-secondary rounded">
              <Plus className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
              <button
                onClick={() => onLayerAdd('map')}
                className="w-full px-3 py-2 text-left hover:bg-secondary text-xs"
              >
                🗺️ Карта
              </button>
              <button
                onClick={() => onLayerAdd('tokens')}
                className="w-full px-3 py-2 text-left hover:bg-secondary text-xs"
              >
                🎭 Токены
              </button>
              <button
                onClick={() => onLayerAdd('drawings')}
                className="w-full px-3 py-2 text-left hover:bg-secondary text-xs"
              >
                ✏️ Рисунки
              </button>
              <button
                onClick={() => onLayerAdd('fog')}
                className="w-full px-3 py-2 text-left hover:bg-secondary text-xs"
              >
                🌫️ Туман
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Список слоев */}
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`border-b border-border last:border-b-0 ${
              activeLayerId === layer.id ? 'bg-primary/10' : ''
            }`}
          >
            <div
              className="p-3 cursor-pointer hover:bg-secondary/50"
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm">{getLayerIcon(layer.type)}</span>
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      onBlur={() => handleRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(layer.id);
                        if (e.key === 'Escape') setEditingLayerId(null);
                      }}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-xs font-medium truncate flex-1"
                      onDoubleClick={() => startRename(layer)}
                    >
                      {layer.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleVisible(layer.id);
                    }}
                    className="p-1 hover:bg-secondary rounded"
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                    className="p-1 hover:bg-secondary rounded"
                  >
                    {layer.locked ? (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </button>
                  <div className="relative group">
                    <button className="p-1 hover:bg-secondary rounded">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[100px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(layer);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-xs"
                      >
                        Переименовать
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLayerDelete(layer.id);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-xs text-destructive"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Слайдер прозрачности */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round((typeof layer.opacity === 'number' ? layer.opacity : 1) * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(typeof layer.opacity === 'number' ? layer.opacity : 1) * 100}
                  onChange={(e) => {
                    e.stopPropagation();
                    onLayerOpacityChange(layer.id, parseInt(e.target.value) / 100);
                  }}
                  className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        ))}
        
        {layers.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-xs">
            Нет слоев
          </div>
        )}
      </div>
    </div>
  );
}