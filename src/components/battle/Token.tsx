
import React, { useState, useRef, useEffect } from 'react';
import { Token as TokenType } from '@/stores/battleStore';

interface TokenProps {
  token: TokenType;
  isSelected: boolean;
  gridSize: { rows: number, cols: number };
  imageSize: { width: number, height: number };
  zoom: number;
  onSelect: (id: number) => void;
  onUpdatePosition: (id: number, x: number, y: number) => void;
  isDM: boolean;
}

const Token: React.FC<TokenProps> = ({
  token,
  isSelected,
  gridSize,
  imageSize,
  zoom,
  onSelect,
  onUpdatePosition,
  isDM
}) => {
  const tokenRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tokenPos, setTokenPos] = useState({ x: token.x, y: token.y });
  
  // Рассчитываем размер ячейки сетки
  const cellWidth = imageSize.width / gridSize.cols;
  const cellHeight = imageSize.height / gridSize.rows;
  
  // Синхронизируем позицию с props
  useEffect(() => {
    setTokenPos({ x: token.x, y: token.y });
  }, [token.x, token.y]);
  
  // Определяем размер токена в зависимости от его размера
  const tokenSize = token.size * cellWidth;
  
  // Обработчик начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDM && token.type === 'player') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Выбираем токен при клике
    onSelect(token.id);
    
    // Если это правый клик или клавиша Shift, не начинаем перетаскивание
    if (e.button === 2 || e.shiftKey) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Обработчик перемещения при перетаскивании
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - startPos.x) / zoom;
    const dy = (e.clientY - startPos.y) / zoom;
    
    // Обновляем локальное положение токена для плавного перемещения
    setTokenPos({
      x: token.x + dx,
      y: token.y + dy
    });
    
    // Устанавливаем новые координаты начала для следующего перемещения
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
    
    // Обновляем координаты в родительском компоненте
    onUpdatePosition(token.id, token.x + dx, token.y + dy);
  };
  
  // Обработчик окончания перетаскивания
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Привязка к сетке после перетаскивания (опционально)
      if (false) { // Если нужно привязывать к сетке, замените на true
        const gridX = Math.round(tokenPos.x / cellWidth) * cellWidth;
        const gridY = Math.round(tokenPos.y / cellHeight) * cellHeight;
        
        setTokenPos({ x: gridX, y: gridY });
        onUpdatePosition(token.id, gridX, gridY);
      }
    }
  };
  
  // Добавляем глобальные обработчики при начале перетаскивания
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos]);
  
  // Получаем цвет рамки в зависимости от типа токена
  const getBorderColor = () => {
    if (isSelected) return 'border-yellow-400 shadow-glow';
    
    switch (token.type) {
      case 'boss':
        return 'border-red-500';
      case 'monster':
        return 'border-orange-400';
      case 'player':
        return 'border-green-400';
      case 'npc':
        return 'border-blue-400';
      default:
        return 'border-white';
    }
  };
  
  // Вычисляем правильное положение токена с учетом его размера
  const positionStyle = {
    left: `${tokenPos.x}px`,
    top: `${tokenPos.y}px`,
    width: `${tokenSize}px`,
    height: `${tokenSize}px`,
    // Центрируем токен на указанных координатах
    transform: `translate(-50%, -50%)`
  };
  
  return (
    <div
      ref={tokenRef}
      className={`absolute rounded-full border-2 ${getBorderColor()} cursor-pointer transition-shadow
                 ${isDragging ? 'cursor-grabbing z-30' : 'cursor-grab z-20'}
                 ${isSelected ? 'z-30' : ''}`}
      style={positionStyle}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Изображение токена */}
      <img
        src={token.img}
        alt={token.name}
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
      
      {/* Индикатор выделения */}
      {isSelected && (
        <div className="absolute -inset-1 rounded-full border-2 border-yellow-400 animate-pulse opacity-50 pointer-events-none" />
      )}
      
      {/* Показатель здоровья */}
      <div className="absolute -bottom-5 left-0 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${token.hp <= token.maxHp * 0.3 ? 'bg-red-500' : token.hp <= token.maxHp * 0.6 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
        />
      </div>
      
      {/* Надпись с именем (если токен выбран) */}
      {isSelected && (
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/70 text-white text-xs rounded whitespace-nowrap">
          {token.name}
        </div>
      )}
    </div>
  );
};

export default Token;
