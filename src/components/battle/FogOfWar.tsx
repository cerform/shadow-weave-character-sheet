import React, { useEffect, useRef, useState } from 'react';
import { LightSource } from '@/types/battle'; 

interface FogOfWarProps {
  gridSize: { rows: number; cols: number };
  revealedCells: { [key: string]: boolean };
  onRevealCell: (row: number, col: number) => void;
  active: boolean;
  lightSources?: LightSource[];
  tokenPositions?: {id: number, x: number, y: number, visible: boolean, type: string}[];
  isDM?: boolean;
  isDynamicLighting?: boolean;
}

const FogOfWar: React.FC<FogOfWarProps> = ({ 
  gridSize, 
  revealedCells, 
  onRevealCell, 
  active, 
  lightSources = [],
  tokenPositions = [],
  isDM = false,
  isDynamicLighting = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({width: 0, height: 0});
  const animationFrameRef = useRef<number | null>(null);
  
  // Получаем размеры контейнера и устанавливаем их для canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: container.clientHeight
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Основная функция рендеринга тумана и освещения
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Устанавливаем размеры canvas
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Если не активен, выходим
    if (!active) return;
    
    // Размер ячейки сетки
    const cellWidth = canvas.width / gridSize.cols;
    const cellHeight = canvas.height / gridSize.rows;
    
    const renderFrame = () => {
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем общий туман войны (полная темнота)
      ctx.fillStyle = isDynamicLighting ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Создаем композитный режим для освещения
      ctx.globalCompositeOperation = 'destination-out';
      
      // Обрабатываем статически открытые клетки
      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          const key = `${row}-${col}`;
          if (revealedCells[key]) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            // Создаем градиент для плавных переходов между открытыми клетками
            const gradient = ctx.createRadialGradient(
              x + cellWidth/2, y + cellHeight/2, 0,  // Внутренняя точка градиента
              x + cellWidth/2, y + cellHeight/2, cellWidth * 0.8  // Внешняя точка градиента
            );
            
            const opacity = isDynamicLighting ? 0.6 : 0.9; // При динамическом освещении уменьшаем базовое открытие
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // Полностью открыто в центре
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.7})`); // Полупрозрачно на краях
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');    // Плавный переход к туману
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - cellWidth/2, y - cellHeight/2, cellWidth*2, cellHeight*2);
          }
        }
      }
      
      // Добавляем динамические источники света
      lightSources.forEach(light => {
        // Нормализуем координаты к координатам canvas
        const x = light.x;
        const y = light.y;
        const radius = light.radius * Math.min(cellWidth, cellHeight);
        
        // Создаем градиент для света
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, radius
        );
        
        // Используем цвет и интенсивность из источника света
        const alphaMax = Math.min(0.95, light.intensity);
        
        // Создаем цвет на основе параметров света
        let lightColor = light.color || 'rgba(255, 255, 255, 1)';
        
        // Преобразуем HTML цвет в rgba, если это не rgba
        if (lightColor.startsWith('#')) {
          const r = parseInt(lightColor.slice(1, 3), 16);
          const g = parseInt(lightColor.slice(3, 5), 16);
          const b = parseInt(lightColor.slice(5, 7), 16);
          lightColor = `rgba(${r}, ${g}, ${b}, 1)`;
        }
        
        // Специальные визуальные эффекты в зависимости от типа света
        switch(light.type) {
          case 'torch':
            gradient.addColorStop(0, `rgba(255, 200, 100, ${alphaMax})`);
            gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alphaMax * 0.7})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            break;
            
          case 'lantern':
            gradient.addColorStop(0, `rgba(255, 230, 150, ${alphaMax})`);
            gradient.addColorStop(0.5, `rgba(255, 210, 120, ${alphaMax * 0.7})`);
            gradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
            break;
            
          case 'daylight':
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alphaMax})`);
            gradient.addColorStop(0.7, `rgba(240, 240, 255, ${alphaMax * 0.7})`);
            gradient.addColorStop(1, 'rgba(220, 220, 255, 0)');
            break;
            
          default: // custom
            // Используем цвет из параметров
            const rgba = lightColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/);
            if (rgba) {
              const r = rgba[1];
              const g = rgba[2];
              const b = rgba[3];
              gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alphaMax})`);
              gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alphaMax * 0.5})`);
              gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            } else {
              // Если формат цвета не распознан, используем белый
              gradient.addColorStop(0, `rgba(255, 255, 255, ${alphaMax})`);
              gradient.addColorStop(0.6, `rgba(255, 255, 255, ${alphaMax * 0.5})`);
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Рисуем линии видимости от токенов игроков
      tokenPositions.filter(token => token.visible && (isDM || token.type === "player")).forEach(token => {
        const x = token.x;
        const y = token.y;
        
        // Создаем линию видимости (поле зрения) для каждого токена
        const visionRadius = isDM ? 
          cellWidth * 5 : // ДМ видит больше
          cellWidth * 3;  // Игроки видят меньше
        
        // Угол обзора (360 градусов для простоты)
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, visionRadius
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, visionRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Возвращаем обычный режим композиции
      ctx.globalCompositeOperation = 'source-over';
      
      // Если есть выбранная зона подсветки
      if (selectedArea) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        const {startX, startY, endX, endY} = selectedArea;
        ctx.fillRect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
      }
      
      // Анимация
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, dimensions, gridSize, revealedCells, lightSources, tokenPositions, isDM, isDynamicLighting]);
  
  // Состояние для выделения области
  const [isDragging, setIsDragging] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  
  // Обработчики для выделения области
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setSelectedArea({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedArea || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedArea({
      ...selectedArea,
      endX: x,
      endY: y
    });
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedArea || !active || !canvasRef.current) {
      setIsDragging(false);
      setSelectedArea(null);
      return;
    }
    
    const canvas = canvasRef.current;
    const cellWidth = canvas.width / gridSize.cols;
    const cellHeight = canvas.height / gridSize.rows;
    
    // Определяем диапазон ячеек для открытия
    const startCol = Math.floor(Math.min(selectedArea.startX, selectedArea.endX) / cellWidth);
    const endCol = Math.floor(Math.max(selectedArea.startX, selectedArea.endX) / cellWidth);
    const startRow = Math.floor(Math.min(selectedArea.startY, selectedArea.endY) / cellHeight);
    const endRow = Math.floor(Math.max(selectedArea.startY, selectedArea.endY) / cellHeight);
    
    // Открываем все ячейки в выделенной области
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
          onRevealCell(row, col);
        }
      }
    }
    
    setIsDragging(false);
    setSelectedArea(null);
  };
  
  // Обработчик клика для раскрытия отдельных ячеек
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active || !canvasRef.current) return;
    
    // Если это конец перетаскивания, не обрабатываем как клик
    if (isDragging) return;
    
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
      width={dimensions.width}
      height={dimensions.height}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default FogOfWar;
