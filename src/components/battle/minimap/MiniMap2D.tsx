import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, MapPin, EyeOff } from 'lucide-react';
import { getModelTypeFromTokenName } from '@/utils/tokenModelMapping';
import { dragonImg, goblinImg, skeletonImg, golemImg, orcImg, wolfImg, trollImg, zombieImg, lichImg, bearImg, spiderImg, elementalImg, wizardImg, rogueImg } from '@/assets/tokens';

interface Token {
  id: string;
  name: string;
  position: { x: number; y: number };
  color: string;
  hp: number;
  maxHp: number;
  isEnemy?: boolean;
}

interface MiniMap2DProps {
  tokens: Token[];
  selectedId: string | null;
  activeToken?: Token;
  mapImage?: string | null;
  mapWidth?: number;
  mapHeight?: number;
  gridSize?: number;
  isDM?: boolean;
  className?: string;
}

export default function MiniMap2D({ 
  tokens = [],
  selectedId,
  activeToken,
  mapImage,
  mapWidth = 1600,
  mapHeight = 900,
  gridSize = 64,
  isDM = false,
  className = "" 
}: MiniMap2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Определяем размеры мини-карты
  const miniWidth = isExpanded ? 320 : 240;
  const miniHeight = isExpanded ? 180 : 135;
  
  // Масштабирование
  const scaleX = miniWidth / mapWidth;
  const scaleY = miniHeight / mapHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем канвас
    ctx.clearRect(0, 0, miniWidth, miniHeight);

    // Рисуем фон карты
    if (mapImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, miniWidth, miniHeight);
        drawTokensAndOverlay();
      };
      img.src = mapImage;
    } else {
      // Рисуем сетку по умолчанию
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, miniWidth, miniHeight);
      
      // Рисуем сетку
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      const gridCellsX = Math.floor(mapWidth / gridSize);
      const gridCellsY = Math.floor(mapHeight / gridSize);
      
      for (let x = 0; x <= gridCellsX; x++) {
        const lineX = (x * gridSize) * scaleX;
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, miniHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= gridCellsY; y++) {
        const lineY = (y * gridSize) * scaleY;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(miniWidth, lineY);
        ctx.stroke();
      }
      
      drawTokensAndOverlay();
    }

    function drawTokensAndOverlay() {
      if (!ctx) return;

      // Рисуем токены
      tokens.forEach(token => {
        const x = token.position.x * scaleX;
        const y = token.position.y * scaleY;
        
        // Рисуем тень токена
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Выбираем цвет токена
        let tokenColor = token.color;
        
        // Подсвечиваем выбранный и активный токены
        if (token.id === selectedId) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
        } else if (token.id === activeToken?.id) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
        }
        
        // Рисуем токен
        ctx.fillStyle = tokenColor;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Рисуем индикатор здоровья для DM
        if (isDM && token.maxHp > 0) {
          const healthPercent = token.hp / token.maxHp;
          const healthBarWidth = 12;
          const healthBarHeight = 3;
          
          // Фон полоски здоровья
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(x - healthBarWidth/2, y - 12, healthBarWidth, healthBarHeight);
          
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
            y - 12, 
            healthBarWidth * Math.max(0, healthPercent), 
            healthBarHeight
          );
        }
        
        // Рисуем иконку или картинку токена
        if (!mapImage) {
          const modelType = getModelTypeFromTokenName(token.name) || 'fighter';
          const tokenImages: Record<string, string> = {
            dragon: dragonImg,
            goblin: goblinImg,
            skeleton: skeletonImg,
            golem: golemImg,
            orc: orcImg,
            wolf: wolfImg,
            troll: trollImg,
            zombie: zombieImg,
            lich: lichImg,
            bear: bearImg,
            spider: spiderImg,
            elemental: elementalImg,
            wizard: wizardImg,
            rogue: rogueImg,
            fighter: '🛡️'
          };
          
          const image = tokenImages[modelType];
          
          if (image && (image.startsWith('data:') || image.includes('.'))) {
            // Создаем Image объект для отрисовки
            const img = new Image();
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(img, x - 6, y - 6, 12, 12);
              ctx.restore();
            };
            img.src = image;
          } else {
            // Отрисовываем эмодзи или первые буквы
            ctx.fillStyle = '#ffffff';
            ctx.font = image === '🛡️' ? '10px Arial' : '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(image || token.name.slice(0, 2).toUpperCase(), x, y + 2);
          }
        }
      });
      
      // Рисуем рамку области видимости (примерно центральная область)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      
      const viewWidth = miniWidth * 0.6;
      const viewHeight = miniHeight * 0.6;
      const viewX = (miniWidth - viewWidth) / 2;
      const viewY = (miniHeight - viewHeight) / 2;
      
      ctx.strokeRect(viewX, viewY, viewWidth, viewHeight);
      ctx.setLineDash([]);
    }
  }, [tokens, selectedId, activeToken, mapImage, isDM, miniWidth, miniHeight, scaleX, scaleY, mapWidth, mapHeight, gridSize]);

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
          width={miniWidth}
          height={miniHeight}
          className="block cursor-pointer"
          onClick={(e) => {
            // TODO: Реализовать клик по мини-карте для навигации
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Преобразуем координаты клика в координаты карты
            const mapX = (clickX / scaleX);
            const mapY = (clickY / scaleY);
            
            console.log('MiniMap clicked at:', { mapX, mapY });
          }}
        />
        
        {/* Легенда */}
        <div className="absolute bottom-1 left-1 bg-background/90 rounded px-2 py-1 text-xs">
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
        <div className="absolute top-1 right-1 bg-primary/90 text-primary-foreground rounded px-2 py-0.5 text-xs">
          {tokens.length}
        </div>
      </div>
    </Card>
  );
}