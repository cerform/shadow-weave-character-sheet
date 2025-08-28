import React, { useCallback, useState } from 'react';
import type { FogCanvasState, FogMouseEvent } from '@/types/fog';

interface FogInteractionLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasState: FogCanvasState;
  active: boolean;
  onCellClick: (row: number, col: number) => void;
  onAreaSelect: (cells: Array<{ row: number; col: number }>) => void;
  getMouseGridPosition: (e: React.MouseEvent<HTMLCanvasElement>) => FogMouseEvent;
  getCellsInArea: (startX: number, startY: number, endX: number, endY: number) => Array<{ row: number; col: number }>;
  onSelectionChange: (area: { startX: number; startY: number; endX: number; endY: number } | null) => void;
}

export function FogInteractionLayer({
  canvasRef,
  canvasState,
  active,
  onCellClick,
  onAreaSelect,
  getMouseGridPosition,
  getCellsInArea,
  onSelectionChange
}: FogInteractionLayerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ 
    startX: number; startY: number; endX: number; endY: number 
  } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active) return;
    
    const mousePos = getMouseGridPosition(e);
    
    setIsDragging(true);
    setDragStart({ x: mousePos.canvasX, y: mousePos.canvasY });
    
    const selection = {
      startX: mousePos.canvasX,
      startY: mousePos.canvasY,
      endX: mousePos.canvasX,
      endY: mousePos.canvasY
    };
    
    setCurrentSelection(selection);
    onSelectionChange(selection);
  }, [active, getMouseGridPosition, onSelectionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !active) return;
    
    const mousePos = getMouseGridPosition(e);
    
    const selection = {
      startX: dragStart.x,
      startY: dragStart.y,
      endX: mousePos.canvasX,
      endY: mousePos.canvasY
    };
    
    setCurrentSelection(selection);
    onSelectionChange(selection);
  }, [isDragging, dragStart, active, getMouseGridPosition, onSelectionChange]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active) return;
    
    if (isDragging && dragStart && currentSelection) {
      const mousePos = getMouseGridPosition(e);
      
      // Проверяем, был ли это клик или перетаскивание
      const dragDistance = Math.sqrt(
        Math.pow(mousePos.canvasX - dragStart.x, 2) + 
        Math.pow(mousePos.canvasY - dragStart.y, 2)
      );
      
      if (dragDistance < 5) {
        // Это был клик
        onCellClick(mousePos.gridRow, mousePos.gridCol);
        
        console.log('🎯 Fog Click:', {
          screenCoords: { x: e.clientX, y: e.clientY },
          canvasCoords: { x: mousePos.canvasX, y: mousePos.canvasY },
          gridCoords: { row: mousePos.gridRow, col: mousePos.gridCol },
          canvasState
        });
      } else {
        // Это было перетаскивание - выделяем область
        const cells = getCellsInArea(
          currentSelection.startX,
          currentSelection.startY,
          currentSelection.endX,
          currentSelection.endY
        );
        
        console.log('🖱️ Fog Area Selection:', {
          selectionArea: currentSelection,
          cellsSelected: cells.length,
          cells
        });
        
        onAreaSelect(cells);
      }
    }
    
    // Сброс состояния
    setIsDragging(false);
    setDragStart(null);
    setCurrentSelection(null);
    onSelectionChange(null);
  }, [
    active, isDragging, dragStart, currentSelection, 
    getMouseGridPosition, getCellsInArea, onCellClick, onAreaSelect, onSelectionChange, canvasState
  ]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Обработка клика уже происходит в handleMouseUp
    // Этот обработчик нужен только для предотвращения всплытия события
    if (!active) return;
    e.stopPropagation();
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 cursor-crosshair"
      width={canvasState.width}
      height={canvasState.height}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'fill',
        pointerEvents: active ? 'auto' : 'none'
      }}
    />
  );
}