
import React from 'react';
import { Token as TokenType } from '@/types/battle';
import TokenHealthBar from './TokenHealthBar';
import { getSizeMultiplier } from '@/utils/tokenHelpers';

interface TokenProps {
  token: TokenType;
  isSelected: boolean;
  gridSize: { rows: number; cols: number };
  imageSize: { width: number; height: number };
  zoom: number;
  onSelect: (id: number | null) => void;
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
  // Состояние для перетаскивания
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  
  // Обработчик клика по токену
  const handleTokenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(token.id);
  };
  
  // Обработчики для перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDM && token.type !== 'player') {
      return; // Только DM может двигать не-игровые токены
    }
    
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) - rect.width / 2,
      y: (e.clientY - rect.top) - rect.height / 2
    });
    setIsDragging(true);
    
    // Добавляем обработчики на документ, чтобы отслеживать перемещение даже вне токена
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const containerRect = document.querySelector('.battle-map-container')?.getBoundingClientRect();
    if (!containerRect) return;
    
    // Вычисляем новые координаты с учетом смещения и зума
    const x = (e.clientX - containerRect.left) / zoom - dragOffset.x;
    const y = (e.clientY - containerRect.top) / zoom - dragOffset.y;
    
    // Обновляем позицию токена
    onUpdatePosition(token.id, x, y);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Размер токена с учетом масштаба - используем getSizeMultiplier для корректной обработки size
  const tokenSize = 30 * getSizeMultiplier(token.size);
  
  // Стиль для токена
  const tokenStyle: React.CSSProperties = {
    left: `${token.x}px`,
    top: `${token.y}px`,
    width: `${tokenSize}px`,
    height: `${tokenSize}px`,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    overflow: 'hidden',
    zIndex: isSelected ? 100 : 10,
    cursor: (isDM || token.type === 'player') ? 'pointer' : 'default',
    boxShadow: isSelected ? '0 0 0 2px gold, 0 0 10px rgba(255, 215, 0, 0.7)' : 'none',
    border: isSelected ? '2px solid gold' : '1px solid rgba(0, 0, 0, 0.3)'
  };
  
  // Стиль для инициативы
  const initiativeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
  };
  
  // Стиль для типа токена
  const typeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: token.type === 'player' ? '#3b82f6' : 
                    token.type === 'boss' ? '#ef4444' : '#9333ea',
    color: '#ffffff',
    borderRadius: '4px',
    padding: '1px 4px',
    fontSize: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
  };
  
  return (
    <div
      className="absolute token select-none"
      style={tokenStyle}
      onClick={handleTokenClick}
      onMouseDown={handleMouseDown}
    >
      {/* HP бар над токеном */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <TokenHealthBar
          currentHP={token.hp}
          maxHP={token.maxHp}
          width={tokenSize}
          showValue={isSelected && isDM}
        />
      )}
      
      <img
        src={token.img}
        alt={token.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      
      {/* Отображаем значение инициативы, если оно есть */}
      {token.initiative !== undefined && (
        <div style={initiativeStyle}>{token.initiative}</div>
      )}
      
      {/* Тип токена */}
      <div style={typeStyle}>{token.type}</div>
    </div>
  );
};

export default Token;
