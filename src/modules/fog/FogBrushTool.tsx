import React, { useCallback, useRef, useState } from 'react';
import type { FogEngine } from './FogEngine';
import type { FogMode } from './FogTypes';

interface FogBrushToolProps {
  engine: FogEngine | null;
  mode: FogMode;
  radius: number;
  cellSize: number;
  offsetX?: number;
  offsetY?: number;
  enabled: boolean;
  onDraw?: () => void;
}

export function FogBrushTool({ 
  engine, 
  mode, 
  radius, 
  cellSize,
  offsetX = 0,
  offsetY = 0,
  enabled,
  onDraw 
}: FogBrushToolProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  const getGridCoords = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offsetX) / cellSize);
    const y = Math.floor((e.clientY - rect.top - offsetY) / cellSize);
    return { x, y };
  }, [cellSize, offsetX, offsetY]);

  const handleDraw = useCallback((e: React.MouseEvent) => {
    if (!enabled || !engine || !isDrawing) return;

    const { x, y } = getGridCoords(e);
    
    // Avoid redrawing same cell
    if (lastCellRef.current?.x === x && lastCellRef.current?.y === y) return;
    
    lastCellRef.current = { x, y };
    
    const changed = engine.applyBrush(x, y, radius, mode);
    
    if (changed.length > 0 && onDraw) {
      onDraw();
    }
  }, [enabled, engine, isDrawing, getGridCoords, radius, mode, onDraw]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    setIsDrawing(true);
    lastCellRef.current = null;
    handleDraw(e);
  }, [enabled, handleDraw]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    lastCellRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    lastCellRef.current = null;
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ 
        cursor: mode === 'reveal' ? 'crosshair' : 'not-allowed',
        pointerEvents: enabled ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleDraw}
      onMouseLeave={handleMouseLeave}
    />
  );
}
