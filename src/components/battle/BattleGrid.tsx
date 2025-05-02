
import React, { useRef, useEffect, useState } from 'react';

interface BattleGridProps {
  gridSize: { rows: number, cols: number };
  visible: boolean;
  opacity: number;
  color?: string;
}

const BattleGrid: React.FC<BattleGridProps> = ({
  gridSize,
  visible,
  opacity,
  color = '#aaadb0'
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
  
  // Рисуем сетку
  useEffect(() => {
    if (!canvasRef.current || !visible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    canvas.width = width;
    canvas.height = height;
    
    const cellWidth = width / gridSize.cols;
    const cellHeight = height / gridSize.rows;
    
    ctx.clearRect(0, 0, width, height);
    
    // Рисуем линии сетки
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;
    
    // Вертикальные линии
    for (let col = 0; col <= gridSize.cols; col++) {
      const x = Math.floor(col * cellWidth) + 0.5; // +0.5 для четкости линий
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Горизонтальные линии
    for (let row = 0; row <= gridSize.rows; row++) {
      const y = Math.floor(row * cellHeight) + 0.5; // +0.5 для четкости линий
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Добавляем координаты на сетке
    ctx.fillStyle = color;
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let col = 0; col < gridSize.cols; col++) {
      const x = col * cellWidth + cellWidth / 2;
      ctx.fillText(col.toString(), x, 12);
    }
    
    for (let row = 0; row < gridSize.rows; row++) {
      const y = row * cellHeight + cellHeight / 2;
      ctx.fillText(row.toString(), 10, y + 4);
    }
  }, [canvasSize, gridSize, visible, opacity, color]);
  
  if (!visible) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
      width={canvasSize.width}
      height={canvasSize.height}
    />
  );
};

export default BattleGrid;
