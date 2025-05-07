
import React, { useState, useEffect } from 'react';
import { TokenData, Initiative } from '@/types/session.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Trash2 } from 'lucide-react';

interface BattleMapProps {
  tokens: TokenData[];
  setTokens: React.Dispatch<React.SetStateAction<TokenData[]>> | ((token: TokenData) => void);
  background: string | null;
  setBackground: (background: string | null) => void;
  onUpdateTokenPosition: (id: string, x: number, y: number) => void;
  onSelectToken: (id: string | null) => void;
  selectedTokenId: string | null;
  initiative?: Initiative[];
  battleActive?: boolean;
}

const BattleMap: React.FC<BattleMapProps> = ({
  tokens,
  setTokens,
  background,
  setBackground,
  onUpdateTokenPosition,
  onSelectToken,
  selectedTokenId,
  initiative = [],
  battleActive = false
}) => {
  const [draggingToken, setDraggingToken] = useState<string | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 1000, height: 800 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Установка фона карты
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBackground(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Создание нового токена
  const handleCreateToken = () => {
    const newToken: TokenData = {
      id: Date.now().toString(),
      name: `Токен ${tokens.length + 1}`,
      img: '/placeholder-token.png', // заглушка, в реальном приложении нужно заменить
      x: Math.random() * mapDimensions.width / 2,
      y: Math.random() * mapDimensions.height / 2,
      size: 50
    };
    
    if (typeof setTokens === 'function') {
      // Проверяем тип функции setTokens
      if ('length' in setTokens && setTokens.length === 1) {
        // Если это функция, которая принимает один аргумент - новый токен
        (setTokens as (token: TokenData) => void)(newToken);
      } else {
        // Если это React.Dispatch от useState
        (setTokens as React.Dispatch<React.SetStateAction<TokenData[]>>)(prev => [...prev, newToken]);
      }
    }
  };

  // Начало перетаскивания токена
  const handleTokenDragStart = (e: React.MouseEvent, tokenId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Выбираем токен и начинаем перетаскивание
    onSelectToken(tokenId);
    setDraggingToken(tokenId);
    
    // Запоминаем смещение курсора относительно токена
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Перетаскивание токена
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (draggingToken !== null) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      
      // Ограничиваем координаты размерами карты
      const clampedX = Math.max(0, Math.min(mapDimensions.width, x));
      const clampedY = Math.max(0, Math.min(mapDimensions.height, y));
      
      // Обновляем позицию токена
      onUpdateTokenPosition(draggingToken, clampedX, clampedY);
    }
  };

  // Завершение перетаскивания токена
  const handleMapMouseUp = () => {
    setDraggingToken(null);
  };

  // Удаление фона карты
  const handleRemoveBackground = () => {
    setBackground(null);
  };

  // Увеличение масштаба карты
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  // Уменьшение масштаба карты
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleBackgroundUpload}
            />
            <Upload className="h-4 w-4 mr-1" />
            Загрузить карту
          </Button>
          
          {background && (
            <Button variant="outline" size="sm" onClick={handleRemoveBackground}>
              <Trash2 className="h-4 w-4 mr-1" />
              Удалить карту
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateToken}>
            Добавить токен
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            Увеличить
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            Уменьшить
          </Button>
        </div>
      </div>
      
      <Card className="relative h-full overflow-hidden">
        <div 
          className="relative h-full"
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: '0 0',
            width: mapDimensions.width,
            height: mapDimensions.height,
            overflow: 'hidden'
          }}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseUp}
        >
          {/* Фон карты */}
          {background ? (
            <img 
              src={background} 
              alt="Battle Map" 
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 grid grid-cols-20 grid-rows-16">
              {Array(320).fill(0).map((_, i) => (
                <div key={i} className="border border-gray-700"></div>
              ))}
            </div>
          )}
          
          {/* Токены */}
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`absolute rounded-full cursor-grab border-2 ${
                token.id === selectedTokenId ? 'border-primary' : 'border-transparent'
              }`}
              style={{
                left: token.x,
                top: token.y,
                width: token.size || 50,
                height: token.size || 50,
                transform: 'translate(-50%, -50%)',
                zIndex: token.id === draggingToken ? 100 : 10
              }}
              onMouseDown={(e) => handleTokenDragStart(e, token.id)}
            >
              <img 
                src={token.img || token.image || '/placeholder-token.png'} 
                alt={token.name || 'Token'} 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Информация о выбранном токене */}
      {selectedTokenId !== null && (
        <div className="mt-2 p-2 border rounded bg-card/50">
          {tokens.find(t => t.id === selectedTokenId)?.name || 'Выбранный токен'}
        </div>
      )}
      
      {/* Список инициативы при активном бое */}
      {battleActive && initiative.length > 0 && (
        <div className="mt-2 p-2 border rounded bg-card/50">
          <h3 className="font-medium mb-1">Инициатива</h3>
          <div className="space-y-1">
            {initiative.map((init) => (
              <div 
                key={init.id}
                className={`p-1 rounded ${init.isActive ? 'bg-primary/20' : ''}`}
              >
                {init.name}: {init.initiative}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleMap;
