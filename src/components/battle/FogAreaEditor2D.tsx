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

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState({
      isDragging: true,
      dragType,
      startX: offsetX,
      startY: offsetY,
      areaId,
      originalArea: { ...area }
    });

    selectFogArea(areaId);
    
    // Add global mouse listeners for better dragging
    const handleGlobalMouseMove = (globalE: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = globalE.clientX - rect.left;
      const currentY = globalE.clientY - rect.top;
      const deltaX = currentX - offsetX;
      const deltaY = currentY - offsetY;

      if (dragType === 'move') {
        updateFogArea(areaId, {
          x: Math.max(50, Math.min(mapWidth - 50, area.x + deltaX / scale)),
          y: Math.max(50, Math.min(mapHeight - 50, area.y + deltaY / scale))
        });
      } else if (dragType === 'resize') {
        if (area.type === 'circle') {
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / scale;
          updateFogArea(areaId, {
            radius: Math.max(20, Math.min(200, area.radius + distance / 2))
          });
        } else if (area.type === 'rectangle') {
          updateFogArea(areaId, {
            width: Math.max(50, Math.min(300, (area.width || 100) + deltaX / scale)),
            height: Math.max(50, Math.min(300, (area.height || 100) + deltaY / scale))
          });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      setDragState(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

  }, [isDM, isEditingFog, fogAreas, selectFogArea, mapWidth, mapHeight, scale, updateFogArea]);

  // Remove this function as we now handle it globally

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
    >
      {/* Animated fog overlay */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, ${fogSettings.fogColor}AA 10%, transparent 40%),
            radial-gradient(circle at 80% 70%, ${fogSettings.fogColor}77 15%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${fogSettings.fogColor}55 20%, transparent 60%),
            linear-gradient(45deg, ${fogSettings.fogColor}${Math.round(fogSettings.fogOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)
          `,
          filter: `blur(${fogSettings.blurAmount}px)`,
          transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
          pointerEvents: fogSettings.globalReveal ? 'none' : 'auto',
          animation: 'fogFlow 10s ease-in-out infinite'
        }}
      />
      
      {/* Secondary fog layer for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 60% 40%, transparent 20%, ${fogSettings.fogColor}44 70%),
            radial-gradient(ellipse at 10% 90%, transparent 30%, ${fogSettings.fogColor}33 80%)
          `,
          filter: `blur(${fogSettings.blurAmount + 5}px)`,
          animation: 'fogFlow2 15s ease-in-out infinite reverse',
          pointerEvents: 'none'
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