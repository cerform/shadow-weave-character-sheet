import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FogCanvasState, FogMouseEvent } from '@/types/fog';

interface UseFogOfWarCanvasProps {
  gridRows: number;
  gridCols: number;
  imageSize?: { width: number; height: number };
}

export function useFogOfWarCanvas({ gridRows, gridCols, imageSize }: UseFogOfWarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Обновление размеров canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          if (imageSize) {
            setDimensions({
              width: imageSize.width,
              height: imageSize.height
            });
          } else {
            setDimensions({
              width: container.clientWidth,
              height: container.clientHeight
            });
          }
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [imageSize]);

  // Мемоизированное состояние canvas
  const canvasState = useMemo<FogCanvasState>(() => {
    const cellWidth = dimensions.width / gridCols;
    const cellHeight = dimensions.height / gridRows;
    
    return {
      width: dimensions.width,
      height: dimensions.height,
      gridRows,
      gridCols,
      cellWidth,
      cellHeight
    };
  }, [dimensions.width, dimensions.height, gridRows, gridCols]);

  // Преобразование координат мыши в координаты сетки
  const getMouseGridPosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>): FogMouseEvent => {
    if (!canvasRef.current) {
      return { canvasX: 0, canvasY: 0, gridRow: 0, gridCol: 0 };
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Координаты относительно canvas на экране
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Нормализуем координаты (0-1)
    const normalizedX = relativeX / rect.width;
    const normalizedY = relativeY / rect.height;
    
    // Преобразуем в координаты сетки
    const gridCol = Math.floor(normalizedX * gridCols);
    const gridRow = Math.floor(normalizedY * gridRows);
    
    // Координаты canvas в пикселях
    const canvasX = normalizedX * canvasState.width;
    const canvasY = normalizedY * canvasState.height;
    
    console.log('🎯 Mouse Position Debug:', {
      screenCoords: { x: e.clientX, y: e.clientY },
      canvasRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      relativeCoords: { x: relativeX, y: relativeY },
      normalizedCoords: { x: normalizedX, y: normalizedY },
      gridCoords: { row: gridRow, col: gridCol },
      canvasCoords: { x: canvasX, y: canvasY },
      canvasState: { width: canvasState.width, height: canvasState.height },
      gridSize: { rows: gridRows, cols: gridCols }
    });
    
    return {
      canvasX,
      canvasY,
      gridRow: Math.max(0, Math.min(gridRows - 1, gridRow)),
      gridCol: Math.max(0, Math.min(gridCols - 1, gridCol))
    };
  }, [canvasState.width, canvasState.height, gridRows, gridCols]);

  // Преобразование координат сетки в пиксельные координаты
  const getPixelPosition = useCallback((row: number, col: number) => {
    return {
      x: col * canvasState.cellWidth + canvasState.cellWidth / 2,
      y: row * canvasState.cellHeight + canvasState.cellHeight / 2
    };
  }, [canvasState.cellWidth, canvasState.cellHeight]);

  // Получение области ячеек в прямоугольнике
  const getCellsInArea = useCallback((
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const cells: Array<{ row: number; col: number }> = [];
    
    // Нормализуем координаты canvas в координаты сетки
    const startCol = Math.floor((Math.min(startX, endX) / canvasState.width) * gridCols);
    const endCol = Math.floor((Math.max(startX, endX) / canvasState.width) * gridCols);
    const startRow = Math.floor((Math.min(startY, endY) / canvasState.height) * gridRows);
    const endRow = Math.floor((Math.max(startY, endY) / canvasState.height) * gridRows);
    
    console.log('📦 Area Selection Debug:', {
      canvasCoords: { startX, startY, endX, endY },
      canvasState: { width: canvasState.width, height: canvasState.height },
      gridBounds: { startRow, endRow, startCol, endCol },
      gridSize: { rows: gridRows, cols: gridCols }
    });
    
    for (let row = Math.max(0, startRow); row <= Math.min(gridRows - 1, endRow); row++) {
      for (let col = Math.max(0, startCol); col <= Math.min(gridCols - 1, endCol); col++) {
        cells.push({ row, col });
      }
    }
    
    return cells;
  }, [canvasState.width, canvasState.height, gridRows, gridCols]);

  return {
    canvasRef,
    canvasState,
    getMouseGridPosition,
    getPixelPosition,
    getCellsInArea
  };
}