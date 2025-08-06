import React, { useRef, useEffect, useState } from 'react';
import { SimpleToken as TokenType } from '@/stores/simpleBattleStore';

interface SimpleTokenProps {
  token: TokenType;
  isSelected: boolean;
  isDragged: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
}

export const SimpleToken: React.FC<SimpleTokenProps> = ({
  token,
  isSelected,
  isDragged,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd
}) => {
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  
  // Локальные координаты для плавного перемещения
  const [localX, setLocalX] = useState(token.x);
  const [localY, setLocalY] = useState(token.y);
  
  // Синхронизируем локальные координаты с пропсами при изменении
  useEffect(() => {
    if (!isDragging.current) {
      setLocalX(token.x);
      setLocalY(token.y);
    }
  }, [token.x, token.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🎯 MOUSE DOWN: ${token.id}`);
    
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    onSelect(token.id);
    onDragStart(token.id, e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      const deltaX = moveEvent.clientX - lastPosition.current.x;
      const deltaY = moveEvent.clientY - lastPosition.current.y;
      
      // Проверяем что есть реальное движение (уменьшил порог)
      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        const newX = localX + deltaX;
        const newY = localY + deltaY;
        
        // Обновляем локальные координаты сразу для плавности
        setLocalX(newX);
        setLocalY(newY);
        
        console.log(`🔄 DRAGGING: ${token.id} from ${localX},${localY} to ${newX}, ${newY} (delta: ${deltaX}, ${deltaY})`);
        onDrag(token.id, newX, newY);
        lastPosition.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      console.log(`🎯 MOUSE UP: ${token.id}`);
      
      if (isDragging.current) {
        isDragging.current = false;
        onDragEnd(token.id);
        
        upEvent.preventDefault();
        upEvent.stopPropagation();
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('mouseleave', handleMouseUp, { passive: false });
  };

  const hpPercentage = (token.hp / token.maxHp) * 100;
  const hpColor = hpPercentage > 50 ? '#22c55e' : hpPercentage > 25 ? '#eab308' : '#ef4444';

  return (
    <div
      className="absolute select-none transition-none"
      style={{
        left: localX - token.size / 2,
        top: localY - token.size / 2,
        width: token.size,
        height: token.size,
        zIndex: isDragged ? 1000 : isSelected ? 100 : 10,
        cursor: isDragged ? 'grabbing' : 'grab',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Token circle */}
      <div
        className="w-full h-full rounded-full border-2 flex items-center justify-center text-white font-bold text-sm shadow-lg"
        style={{
          backgroundColor: token.color,
          borderColor: isSelected ? '#fbbf24' : isDragged ? '#f59e0b' : '#000000',
          borderWidth: isSelected || isDragged ? '3px' : '2px',
          transform: isDragged ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isDragged ? '0 8px 25px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        {token.name.split(' ').map(word => word[0]).join('').toUpperCase()}
      </div>

      {/* HP Bar */}
      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-700 rounded-full">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${hpPercentage}%`,
            backgroundColor: hpColor
          }}
        />
      </div>

      {/* Token name */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black bg-opacity-70 px-1 rounded whitespace-nowrap">
        {token.name}
      </div>
    </div>
  );
};