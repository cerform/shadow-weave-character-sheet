import React, { useRef, useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket';

interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
}

interface BattleCanvasProps {
  width?: number;
  height?: number;
  gridSize?: number;
  isDM?: boolean;
  tokens: Token[];
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onTokenAdd?: (token: Omit<Token, 'id'>) => void;
  onTokenSelect?: (tokenId: string | null) => void;
}

const BattleCanvas: React.FC<BattleCanvasProps> = ({
  width = 800,
  height = 600,
  gridSize = 30,
  isDM = false,
  tokens = [],
  onTokenMove,
  onTokenAdd,
  onTokenSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Отрисовка сетки
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Вертикальные линии
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0; // Сброс прозрачности
  }, [width, height, gridSize]);

  // Отрисовка токена
  const drawToken = useCallback((ctx: CanvasRenderingContext2D, token: Token) => {
    const radius = (token.size * gridSize) / 2;
    
    // Тень для выбранного токена
    if (selectedToken === token.id) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
    }

    // Основной круг токена
    ctx.beginPath();
    ctx.arc(token.x, token.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = token.color;
    ctx.fill();
    ctx.strokeStyle = selectedToken === token.id ? '#FFD700' : '#000';
    ctx.lineWidth = selectedToken === token.id ? 3 : 1;
    ctx.stroke();

    // Сброс тени
    ctx.shadowBlur = 0;

    // Имя токена
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(token.name, token.x, token.y - radius - 5);

    // HP бар если есть
    if (token.hp !== undefined && token.maxHp !== undefined) {
      const barWidth = radius * 2;
      const barHeight = 6;
      const barX = token.x - radius;
      const barY = token.y + radius + 5;

      // Фон HP бара
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Текущий HP
      const hpPercent = token.hp / token.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFFF00' : '#FF0000';
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

      // Текст HP
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(`${token.hp}/${token.maxHp}`, token.x, barY + barHeight + 12);
    }
  }, [selectedToken, gridSize]);

  // Основная функция отрисовки
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Применяем смещение для панорамирования
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);

    // Отрисовка сетки
    drawGrid(ctx);

    // Отрисовка токенов
    tokens.forEach(token => drawToken(ctx, token));

    ctx.restore();
  }, [width, height, tokens, drawGrid, drawToken, panOffset]);

  // Получение координат мыши относительно canvas с учетом панорамирования
  const getMousePos = useCallback((e: MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - panOffset.x,
      y: e.clientY - rect.top - panOffset.y
    };
  }, [panOffset]);

  // Привязка к сетке
  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [gridSize]);

  // Поиск токена под курсором
  const getTokenAt = useCallback((x: number, y: number): Token | null => {
    for (const token of tokens) {
      const radius = (token.size * gridSize) / 2;
      const distance = Math.sqrt(Math.pow(x - token.x, 2) + Math.pow(y - token.y, 2));
      if (distance <= radius) {
        return token;
      }
    }
    return null;
  }, [tokens, gridSize]);

  // Обработчик клика мыши
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const pos = getMousePos(e);
    const token = getTokenAt(pos.x, pos.y);

    // Проверяем правую кнопку мыши для панорамирования
    if (e.button === 2 || e.ctrlKey) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (token) {
      setSelectedToken(token.id);
      onTokenSelect?.(token.id);
      
      if (isDM || token.type === 'player') {
        setIsDragging(true);
        setDragOffset({
          x: pos.x - token.x,
          y: pos.y - token.y
        });
      }
    } else {
      setSelectedToken(null);
      onTokenSelect?.(null);
      
      // Только DM может добавлять токены кликом по пустому месту
      if (isDM && onTokenAdd && !isDragging) {
        const snapped = snapToGrid(pos.x, pos.y);
        const newToken: Omit<Token, 'id'> = {
          name: 'Новый токен',
          x: snapped.x,
          y: snapped.y,
          color: '#FF6B6B',
          size: 1,
          type: 'npc'
        };
        onTokenAdd(newToken);
      }
    }
  }, [getMousePos, getTokenAt, isDM, onTokenAdd, onTokenSelect, snapToGrid, isDragging]);

  // Обработчик движения мыши
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Панорамирование карты
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Перетаскивание токенов
    if (!isDragging || !selectedToken) return;

    const pos = getMousePos(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;
    const snapped = snapToGrid(newX, newY);

    if (onTokenMove) {
      onTokenMove(selectedToken, snapped.x, snapped.y);
    }
  }, [isPanning, lastPanPoint, isDragging, selectedToken, getMousePos, dragOffset, snapToGrid, onTokenMove]);

  // Обработчик отпускания мыши
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  // Эффект для отрисовки
  useEffect(() => {
    draw();
  }, [draw]);

  // Эффект для обработчиков событий
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Блокируем контекстное меню для правой кнопки мыши
    const handleContextMenu = (e: Event) => e.preventDefault();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div className="battle-canvas-container border rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="text-xs text-muted-foreground p-2 border-b bg-muted/20">
        Управление: ЛКМ - выбрать/переместить токен | ПКМ/Ctrl+ЛКМ - панорамирование карты
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair block"
        style={{ 
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'grab'
        }}
      />
    </div>
  );
};

export default BattleCanvas;
