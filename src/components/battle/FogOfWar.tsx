
import React, { useState, useEffect, useRef } from 'react';

interface FogOfWarProps {
  gridSize: { rows: number, cols: number };
  revealedCells: { [key: string]: boolean };
  onRevealCell: (row: number, col: number) => void;
  active: boolean;
}

const FogOfWar: React.FC<FogOfWarProps> = ({
  gridSize,
  revealedCells,
  onRevealCell,
  active
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Устанавливаем размер канваса
  useEffect(() => {
    const updateCanvasSize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        setCanvasSize({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Рисуем туман войны
  useEffect(() => {
    if (!canvasRef.current || !active) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    canvas.width = width;
    canvas.height = height;
    
    const cellWidth = width / gridSize.cols;
    const cellHeight = height / gridSize.rows;
    
    // Заливаем весь канвас черным (туман войны)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Очищаем открытые клетки
    ctx.globalCompositeOperation = 'destination-out';
    
    // Проходим по всем открытым клеткам
    Object.keys(revealedCells).forEach(key => {
      const [row, col] = key.split('-').map(Number);
      
      // Рисуем с небольшим сглаживанием для плавности
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      // Рисуем немного больший прямоугольник для перекрытия краев
      ctx.fillRect(x - 1, y - 1, cellWidth + 2, cellHeight + 2);
    });
    
    // Возвращаем обычный режим рисования
    ctx.globalCompositeOperation = 'source-over';
    
  }, [canvasSize, gridSize, revealedCells, active]);
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / (canvasSize.width / gridSize.cols));
    const row = Math.floor(y / (canvasSize.height / gridSize.rows));
    
    onRevealCell(row, col);
  };
  
  if (!active) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 cursor-pointer"
      onClick={handleClick}
      width={canvasSize.width}
      height={canvasSize.height}
    />
  );
};

export default FogOfWar;
