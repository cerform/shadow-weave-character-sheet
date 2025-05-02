
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
    
    // Добавляем плавную границу для перехода между раскрытыми и нераскрытыми ячейками
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const key = `${row}-${col}`;
        if (revealedCells[key]) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          const borderWidth = Math.min(cellWidth, cellHeight) * 0.3; // Ширина размытия
          
          // Проверяем соседние ячейки и добавляем градиент, если они скрыты
          const directions = [
            {r: -1, c: 0, side: 'top'},    // верх
            {r: 1, c: 0, side: 'bottom'},  // низ
            {r: 0, c: -1, side: 'left'},   // лево
            {r: 0, c: 1, side: 'right'},   // право
            {r: -1, c: -1, side: 'topLeft'},     // верхний левый угол
            {r: -1, c: 1, side: 'topRight'},     // верхний правый угол
            {r: 1, c: -1, side: 'bottomLeft'},   // нижний левый угол
            {r: 1, c: 1, side: 'bottomRight'}    // нижний правый угол
          ];
          
          directions.forEach(dir => {
            const nr = row + dir.r;
            const nc = col + dir.c;
            
            if (nr >= 0 && nr < gridSize.rows && nc >= 0 && nc < gridSize.cols) {
              const nKey = `${nr}-${nc}`;
              if (!revealedCells[nKey]) {
                let gx = x, gy = y, gx2 = x, gy2 = y;
                const gradient = ctx.createRadialGradient(
                  x + cellWidth/2, y + cellHeight/2, 0,  // внутренняя точка градиента
                  x + cellWidth/2, y + cellHeight/2, cellWidth * 0.7  // внешняя точка градиента
                );
                
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
                
                ctx.save();
                ctx.fillStyle = gradient;
                
                // Создаем маску для градиента, чтобы он отображался только на границе с туманом
                ctx.beginPath();
                
                if (dir.side === 'top') {
                  ctx.rect(x, y, cellWidth, borderWidth);
                } else if (dir.side === 'bottom') {
                  ctx.rect(x, y + cellHeight - borderWidth, cellWidth, borderWidth);
                } else if (dir.side === 'left') {
                  ctx.rect(x, y, borderWidth, cellHeight);
                } else if (dir.side === 'right') {
                  ctx.rect(x + cellWidth - borderWidth, y, borderWidth, cellHeight);
                } else if (dir.side === 'topLeft') {
                  ctx.rect(x, y, borderWidth, borderWidth);
                } else if (dir.side === 'topRight') {
                  ctx.rect(x + cellWidth - borderWidth, y, borderWidth, borderWidth);
                } else if (dir.side === 'bottomLeft') {
                  ctx.rect(x, y + cellHeight - borderWidth, borderWidth, borderWidth);
                } else if (dir.side === 'bottomRight') {
                  ctx.rect(x + cellWidth - borderWidth, y + cellHeight - borderWidth, borderWidth, borderWidth);
                }
                
                ctx.clip();
                ctx.fillRect(x - cellWidth, y - cellHeight, cellWidth * 3, cellHeight * 3);
                ctx.restore();
              }
            }
          });
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
      className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
      onClick={handleClick}
    />
  );
};

export default FogOfWar;
