import React, { useRef, useCallback, useState } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogDrawingOverlayProps {
  mapWidth: number;
  mapHeight: number;
  scale?: number;
}

export const FogDrawingOverlay: React.FC<FogDrawingOverlayProps> = ({ 
  mapWidth, 
  mapHeight, 
  scale = 1 
}) => {
  const {
    visibleAreas,
    fogSettings,
    isDrawingMode,
    isDM,
    isDrawing,
    setIsDrawing,
    drawVisibleArea
  } = useFogOfWarStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getMapCoordinates = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    
    return { x, y };
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDM || !isDrawingMode) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const { x, y } = getMapCoordinates(e.clientX, e.clientY);
    drawVisibleArea(x, y);
  }, [isDM, isDrawingMode, getMapCoordinates, drawVisibleArea, setIsDrawing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getMapCoordinates(e.clientX, e.clientY);
    setMousePos({ x: x * scale, y: y * scale });

    if (!isDM || !isDrawingMode || !isDrawing) return;
    
    const mapCoords = getMapCoordinates(e.clientX, e.clientY);
    drawVisibleArea(mapCoords.x, mapCoords.y);
  }, [isDM, isDrawingMode, isDrawing, getMapCoordinates, drawVisibleArea, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, [setIsDrawing]);

  if (!fogSettings.enabled || !isDM) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30"
      style={{
        width: mapWidth * scale,
        height: mapHeight * scale,
        cursor: isDrawingMode ? 'crosshair' : 'default',
        pointerEvents: isDrawingMode ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Brush cursor preview */}
      {isDrawingMode && (
        <div
          className="absolute pointer-events-none border-2 border-primary/50 rounded-full"
          style={{
            left: mousePos.x - (fogSettings.brushSize * scale) / 2,
            top: mousePos.y - (fogSettings.brushSize * scale) / 2,
            width: fogSettings.brushSize * scale,
            height: fogSettings.brushSize * scale,
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }}
        />
      )}

      {/* Drawing instructions */}
      {isDrawingMode && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">Режим рисования</div>
          <div className="text-muted-foreground">
            Нажмите и ведите мышью чтобы открыть области видимости
          </div>
        </div>
      )}
    </div>
  );
};