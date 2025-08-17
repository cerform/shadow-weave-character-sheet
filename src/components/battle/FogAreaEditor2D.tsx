import React, { useState, useRef, useCallback } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogAreaEditor2DProps {
  mapWidth: number;
  mapHeight: number;
  scale?: number;
}

export const FogAreaEditor2D: React.FC<FogAreaEditor2DProps> = ({ 
  mapWidth, 
  mapHeight, 
  scale = 1 
}) => {
  const {
    fogAreas,
    fogSettings,
    isEditingFog,
    selectedFogArea,
    updateFogArea,
    selectFogArea,
    isDM
  } = useFogOfWarStore();

  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'move' | 'resize';
    startX: number;
    startY: number;
    areaId: string;
    originalArea?: any;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, areaId: string, dragType: 'move' | 'resize') => {
    if (!isDM || !isEditingFog) return;

    e.preventDefault();
    e.stopPropagation();

    const area = fogAreas.find(a => a.id === areaId);
    if (!area) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      isDragging: true,
      dragType,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      areaId,
      originalArea: { ...area }
    });

    selectFogArea(areaId);
  }, [isDM, isEditingFog, fogAreas, selectFogArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || !isDM) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragState.startX;
    const deltaY = currentY - dragState.startY;

    const area = dragState.originalArea;
    if (!area) return;

    if (dragState.dragType === 'move') {
      updateFogArea(dragState.areaId, {
        x: Math.max(0, Math.min(mapWidth, area.x + deltaX / scale)),
        y: Math.max(0, Math.min(mapHeight, area.y + deltaY / scale))
      });
    } else if (dragState.dragType === 'resize') {
      if (area.type === 'circle') {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / scale;
        updateFogArea(dragState.areaId, {
          radius: Math.max(10, area.radius + distance / 2)
        });
      } else if (area.type === 'rectangle') {
        updateFogArea(dragState.areaId, {
          width: Math.max(20, (area.width || 100) + deltaX / scale),
          height: Math.max(20, (area.height || 100) + deltaY / scale)
        });
      }
    }
  }, [dragState, isDM, mapWidth, mapHeight, scale, updateFogArea]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  if (!fogSettings.enabled || !isDM) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        width: mapWidth * scale,
        height: mapHeight * scale,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Fog overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${fogSettings.fogColor}${Math.round(fogSettings.fogOpacity * 255).toString(16).padStart(2, '0')} 100%)`,
          filter: `blur(${fogSettings.blurAmount}px)`,
          transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
          pointerEvents: fogSettings.globalReveal ? 'none' : 'auto'
        }}
      />

      {/* Fog areas */}
      {fogAreas.map((area) => {
        const isSelected = selectedFogArea === area.id;

        return (
          <div key={area.id}>
            {/* Revealed area (hole in fog) */}
            {area.revealed && (
              <div
                className="absolute"
                style={{
                  left: area.type === 'circle' 
                    ? (area.x - area.radius) * scale 
                    : area.x * scale,
                  top: area.type === 'circle' 
                    ? (area.y - area.radius) * scale 
                    : area.y * scale,
                  width: area.type === 'circle' 
                    ? area.radius * 2 * scale 
                    : (area.width || 100) * scale,
                  height: area.type === 'circle' 
                    ? area.radius * 2 * scale 
                    : (area.height || 100) * scale,
                  borderRadius: area.type === 'circle' ? '50%' : '0',
                  background: 'transparent',
                  boxShadow: `inset 0 0 0 9999px ${fogSettings.fogColor}`,
                  filter: `blur(${fogSettings.blurAmount}px)`,
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Editor controls */}
            {isEditingFog && (
              <div
                className={`absolute border-2 border-dashed ${
                  isSelected ? 'border-primary' : 'border-muted-foreground'
                } ${area.revealed ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                style={{
                  left: area.type === 'circle' 
                    ? (area.x - area.radius) * scale 
                    : area.x * scale,
                  top: area.type === 'circle' 
                    ? (area.y - area.radius) * scale 
                    : area.y * scale,
                  width: area.type === 'circle' 
                    ? area.radius * 2 * scale 
                    : (area.width || 100) * scale,
                  height: area.type === 'circle' 
                    ? area.radius * 2 * scale 
                    : (area.height || 100) * scale,
                  borderRadius: area.type === 'circle' ? '50%' : '0',
                  pointerEvents: 'auto',
                  cursor: 'move'
                }}
                onMouseDown={(e) => handleMouseDown(e, area.id, 'move')}
              >
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize transform translate-x-1/2 translate-y-1/2"
                  onMouseDown={(e) => handleMouseDown(e, area.id, 'resize')}
                />

                {/* Area label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs font-medium whitespace-nowrap">
                  {area.type === 'circle' ? `Круг ${Math.round(area.radius)}` : `${area.width}×${area.height}`}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Editing instruction */}
      {isEditingFog && fogAreas.length > 0 && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">Режим редактирования</div>
          <div className="text-muted-foreground">
            • Перетаскивайте области для перемещения<br/>
            • Тяните за правый нижний угол для изменения размера<br/>
            • Зеленые области видны игрокам
          </div>
        </div>
      )}
    </div>
  );
};