import React, { useRef, useEffect, useState } from 'react';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, MapPin, Eye, EyeOff } from 'lucide-react';

interface MiniMapProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function MiniMap({ 
  width = 240, 
  height = 160, 
  className = "" 
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    tokens, 
    mapImageUrl, 
    selectedTokenId, 
    activeId,
    isDM 
  } = useUnifiedBattleStore();

  // Определяем размеры мини-карты
  const mapWidth = isExpanded ? width * 1.5 : width;
  const mapHeight = isExpanded ? height * 1.5 : height;
  
  // Масштабирование: предполагаем, что основная карта 24x16 единиц
  const scaleX = mapWidth / 24;
  const scaleY = mapHeight / 16;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем канвас
    ctx.clearRect(0, 0, mapWidth, mapHeight);

    // Рисуем фон карты
    if (mapImageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, mapWidth, mapHeight);
        drawTokensAndOverlay();
      };
      img.src = mapImageUrl;
    } else {
      // Рисуем сетку по умолчанию
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, mapWidth, mapHeight);
      
      // Рисуем сетку
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= mapWidth; x += scaleX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mapHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= mapHeight; y += scaleY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(mapWidth, y);
        ctx.stroke();
      }
      
      drawTokensAndOverlay();
    }

    function drawTokensAndOverlay() {
      if (!ctx) return;

      // Рисуем токены
      tokens.forEach(token => {
        const x = (token.position[0] + 12) * scaleX; // Центрируем координаты (-12 to 12 -> 0 to 24)
        const z = (token.position[2] + 8) * scaleY;  // Центрируем координаты (-8 to 8 -> 0 to 16)
        
        // Рисуем тень токена
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 1, z + 1, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Выбираем цвет токена
        let tokenColor = token.color || (token.isEnemy ? '#dc2626' : '#3b82f6');
        
        // Подсвечиваем выбранный и активный токены
        if (token.id === selectedTokenId) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
        } else if (token.id === activeId) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
        }
        
        // Рисуем токен
        ctx.fillStyle = tokenColor;
        ctx.beginPath();
        ctx.arc(x, z, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Рисуем индикатор здоровья для DM
        if (isDM) {
          const healthPercent = token.hp / token.maxHp;
          const healthBarWidth = 8;
          const healthBarHeight = 2;
          
          // Фон полоски здоровья
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(x - healthBarWidth/2, z - 8, healthBarWidth, healthBarHeight);
          
          // Полоска здоровья
          if (healthPercent > 0.6) {
            ctx.fillStyle = '#10b981';
          } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#f59e0b';
          } else {
            ctx.fillStyle = '#ef4444';
          }
          
          ctx.fillRect(
            x - healthBarWidth/2, 
            z - 8, 
            healthBarWidth * healthPercent, 
            healthBarHeight
          );
        }
      });
      
      // Рисуем индикатор области видимости камеры
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const cameraViewWidth = 8 * scaleX;  // Примерная область видимости камеры
      const cameraViewHeight = 6 * scaleY;
      const cameraX = mapWidth / 2 - cameraViewWidth / 2;
      const cameraY = mapHeight / 2 - cameraViewHeight / 2;
      
      ctx.strokeRect(cameraX, cameraY, cameraViewWidth, cameraViewHeight);
      ctx.setLineDash([]);
    }
  }, [tokens, mapImageUrl, selectedTokenId, activeId, isDM, mapWidth, mapHeight, scaleX, scaleY]);

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Мини-карта
        </Button>
      </div>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 p-3 bg-background/90 backdrop-blur-sm border-border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Мини-карта</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="relative border border-border rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={mapWidth}
          height={mapHeight}
          className="block cursor-pointer"
          onClick={(e) => {
            // TODO: Реализовать клик по мини-карте для навигации
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log('MiniMap clicked at:', { x, y });
          }}
        />
        
        {/* Легенда */}
        <div className="absolute bottom-1 left-1 bg-background/80 rounded px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-muted-foreground">Союзники</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">Враги</span>
            </div>
          </div>
        </div>
        
        {/* Индикатор количества токенов */}
        <div className="absolute top-1 right-1 bg-primary/80 text-primary-foreground rounded px-2 py-0.5 text-xs">
          {tokens.length} токенов
        </div>
      </div>
    </Card>
  );
}