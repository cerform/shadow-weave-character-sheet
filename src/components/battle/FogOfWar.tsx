
import React, { useEffect, useRef } from 'react';

interface FogOfWarProps {
  gridSize: { rows: number; cols: number };
  revealedCells: { [key: string]: boolean };
  onRevealCell: (row: number, col: number) => void;
  active: boolean;
}

const FogOfWar: React.FC<FogOfWarProps> = ({ gridSize, revealedCells, onRevealCell, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Перерисовываем туман войны при изменении состояния или размеров
  useEffect(() => {
    if (!active) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Устанавливаем размеры canvas по размеру контейнера
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Если не активен, выходим
    if (!active) return;
    
    // Размер ячейки сетки
    const cellWidth = canvas.width / gridSize.cols;
    const cellHeight = canvas.height / gridSize.rows;
    
    // Рисуем туман войны
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    
    // Рисуем прямоугольники для каждой ячейки, кроме раскрытых
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const key = `${row}-${col}`;
        if (!revealedCells[key]) {
          ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        }
      }
    }
    
    // Добавляем полупрозрачную границу для плавного перехода между раскрытыми и нераскрытыми ячейками
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const key = `${row}-${col}`;
        if (revealedCells[key]) {
          // Проверяем соседние ячейки и добавляем градиент, если они скрыты
          const checkNeighbor = (r: number, c: number, gx: number, gy: number, gw: number, gh: number) => {
            if (r >= 0 && r < gridSize.rows && c >= 0 && c < gridSize.cols) {
              const nKey = `${r}-${c}`;
              if (!revealedCells[nKey]) {
                const gradient = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
              }
            }
          };
          
          // Проверяем соседей по всем направлениям
          checkNeighbor(row - 1, col, col * cellWidth, row * cellHeight, 0, -cellHeight); // верх
          checkNeighbor(row + 1, col, col * cellWidth, row * cellHeight, 0, cellHeight); // низ
          checkNeighbor(row, col - 1, col * cellWidth, row * cellHeight, -cellWidth, 0); // лево
          checkNeighbor(row, col + 1, col * cellWidth, row * cellHeight, cellWidth, 0); // право
        }
      }
    }
    
  }, [active, gridSize, revealedCells]);
  
  // Обработчик клика для раскрытия ячеек
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Определяем координаты ячейки
    const cellWidth = canvas.width / gridSize.cols;
    const cellHeight = canvas.height / gridSize.rows;
    
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    // Вызываем функцию раскрытия
    onRevealCell(row, col);
  };
  
  // Если туман не активен, не отображаем
  if (!active) return null;
  
  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 cursor-pointer"
      onClick={handleClick}
    />
  );
};

export default FogOfWar;
