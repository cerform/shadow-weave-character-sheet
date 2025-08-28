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
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Преобразуем в координаты сетки
    const gridCol = Math.floor((canvasX / rect.width) * gridCols);
    const gridRow = Math.floor((canvasY / rect.height) * gridRows);
    
    return {
      canvasX: (canvasX / rect.width) * canvasState.width,
      canvasY: (canvasY / rect.height) * canvasState.height,
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
    
    const startCol = Math.floor(Math.min(startX, endX) / canvasState.cellWidth);
    const endCol = Math.floor(Math.max(startX, endX) / canvasState.cellWidth);
    const startRow = Math.floor(Math.min(startY, endY) / canvasState.cellHeight);
    const endRow = Math.floor(Math.max(startY, endY) / canvasState.cellHeight);
    
    for (let row = Math.max(0, startRow); row <= Math.min(gridRows - 1, endRow); row++) {
      for (let col = Math.max(0, startCol); col <= Math.min(gridCols - 1, endCol); col++) {
        cells.push({ row, col });
      }
    }
    
    return cells;
  }, [canvasState.cellWidth, canvasState.cellHeight, gridRows, gridCols]);

  return {
    canvasRef,
    canvasState,
    getMouseGridPosition,
    getPixelPosition,
    getCellsInArea
  };
}