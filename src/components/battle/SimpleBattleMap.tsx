import React, { useRef, useState } from 'react';
import { useSimpleBattleStore } from '@/stores/simpleBattleStore';
import { SimpleToken } from './SimpleToken';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Grid, Upload, Trash2, Eye, EyeOff } from 'lucide-react';

export const SimpleBattleMap: React.FC<{ isDM?: boolean }> = ({ isDM = true }) => {
  const {
    tokens,
    selectedTokenId,
    draggedTokenId,
    mapBackground,
    gridSize,
    showGrid,
    selectToken,
    setDraggedToken,
    moveToken,
    setMapBackground,
    setGridSize,
    toggleGrid,
    clearTokens,
    addToken
  } = useSimpleBattleStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapSize] = useState({ width: 1200, height: 800 });

  const handleTokenSelect = (id: string) => {
    selectToken(selectedTokenId === id ? null : id);
  };

  const handleTokenDragStart = (id: string, e: React.MouseEvent) => {
    setDraggedToken(id);
    console.log(`🎯 DRAG START: ${id}`);
  };

  const handleTokenDrag = (id: string, x: number, y: number) => {
    // Убираем жёсткие ограничения - даём больше свободы движения
    const boundedX = Math.max(10, Math.min(x, mapSize.width - 10));
    const boundedY = Math.max(10, Math.min(y, mapSize.height - 10));
    
    console.log(`📍 MOVE TOKEN: ${id} to ${boundedX}, ${boundedY} (requested: ${x}, ${y})`);
    moveToken(id, boundedX, boundedY);
  };

  const handleTokenDragEnd = (id: string) => {
    setDraggedToken(null);
    console.log(`🎯 DRAG END: ${id}`);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (e.target === mapRef.current) {
      selectToken(null);
    }
  };

  const handleMapDoubleClick = (e: React.MouseEvent) => {
    if (!isDM || e.target !== mapRef.current) return;

    const rect = mapRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addToken({
      name: `Token ${tokens.length + 1}`,
      x,
      y,
      color: '#6b7280',
      size: 45,
      hp: 10,
      maxHp: 10,
      ac: 12,
      type: 'monster',
      controlledBy: 'dm'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMapBackground(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    
    // Вертикальные линии
    for (let x = 0; x <= mapSize.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={mapSize.height}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      );
    }
    
    // Горизонтальные линии
    for (let y = 0; y <= mapSize.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={mapSize.width}
          y2={y}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={mapSize.width}
        height={mapSize.height}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex bg-slate-900">
      {/* Sidebar для DM */}
      {isDM && (
        <Card className="w-80 h-full bg-slate-800 border-slate-700 rounded-none">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-white">Управление картой</h3>
            
            {/* Загрузка фона */}
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Загрузить фон
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Управление сеткой */}
            <div className="space-y-2">
              <Button
                onClick={toggleGrid}
                variant="outline"
                className="w-full"
              >
                {showGrid ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showGrid ? 'Скрыть сетку' : 'Показать сетку'}
              </Button>
              
              {showGrid && (
                <div className="space-y-2">
                  <label className="text-sm text-white">Размер сетки: {gridSize}px</label>
                  <Slider
                    value={[gridSize]}
                    onValueChange={(value) => setGridSize(value[0])}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Очистка токенов */}
            <Button
              onClick={clearTokens}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить токены
            </Button>

            {/* Список токенов */}
            <div className="space-y-2">
              <h4 className="text-md font-semibold text-white">Токены ({tokens.length})</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className={`p-2 rounded text-sm cursor-pointer ${
                      selectedTokenId === token.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                    onClick={() => handleTokenSelect(token.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: token.color }}
                      />
                      <span>{token.name}</span>
                    </div>
                    <div className="text-xs opacity-75">
                      HP: {token.hp}/{token.maxHp} | AC: {token.ac}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-4">
              💡 Двойной клик на карте - добавить токен
            </div>
          </div>
        </Card>
      )}

      {/* Основная карта */}
      <div className="flex-1 h-full relative overflow-hidden">
        <div
          ref={mapRef}
          className="relative w-full h-full bg-slate-800"
          style={{
            backgroundImage: mapBackground ? `url(${mapBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={handleMapClick}
          onDoubleClick={handleMapDoubleClick}
        >
          {/* Сетка */}
          {renderGrid()}

          {/* Токены */}
          {tokens.map((token) => (
            <SimpleToken
              key={token.id}
              token={token}
              isSelected={selectedTokenId === token.id}
              isDragged={draggedTokenId === token.id}
              onSelect={handleTokenSelect}
              onDragStart={handleTokenDragStart}
              onDrag={handleTokenDrag}
              onDragEnd={handleTokenDragEnd}
            />
          ))}

          {/* Индикатор выбранного токена */}
          {selectedTokenId && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded">
              Выбран: {tokens.find(t => t.id === selectedTokenId)?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleBattleMap;