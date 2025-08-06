import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layer, Rect, Circle, Group } from 'react-konva';
import Konva from 'konva';

interface FogOfWarProps {
  width: number;
  height: number;
  gridSize: number;
  visible: boolean;
  isDM: boolean;
  onVisibilityChange?: (visibleAreas: VisibleArea[]) => void;
  initialVisibleAreas?: VisibleArea[];
}

export interface VisibleArea {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'circle' | 'rectangle';
  width?: number;
  height?: number;
}

const FogOfWarLayer: React.FC<FogOfWarProps> = ({
  width,
  height,
  gridSize,
  visible,
  isDM,
  onVisibilityChange,
  initialVisibleAreas = []
}) => {
  const [visibleAreas, setVisibleAreas] = useState<VisibleArea[]>(initialVisibleAreas);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'reveal' | 'hide' | null>(null);
  const [brushSize, setBrushSize] = useState(100);
  const layerRef = useRef<Konva.Layer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Создаем маску тумана войны
  const createFogMask = useCallback(() => {
    if (!layerRef.current) return;

    const layer = layerRef.current;
    layer.destroyChildren();

    // Основной фон тумана
    const fogRect = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fill: '#000000',
      opacity: isDM ? 0.3 : 0.8, // DM видит туман слабее
      listening: false
    });

    layer.add(fogRect);

    // Создаем отверстия в тумане (видимые области)
    visibleAreas.forEach(area => {
      let hole;
      
      if (area.type === 'circle') {
        hole = new Konva.Circle({
          x: area.x,
          y: area.y,
          radius: area.radius,
          fill: '#000000',
          globalCompositeOperation: 'destination-out',
          listening: false
        });
      } else {
        hole = new Konva.Rect({
          x: area.x,
          y: area.y,
          width: area.width || brushSize,
          height: area.height || brushSize,
          fill: '#000000',
          globalCompositeOperation: 'destination-out',
          listening: false
        });
      }
      
      layer.add(hole);
    });

    layer.batchDraw();
  }, [width, height, visibleAreas, isDM, brushSize]);

  // Пересоздаем маску при изменении видимых областей
  useEffect(() => {
    createFogMask();
  }, [createFogMask]);

  // Обрабатываем начало рисования
  const handleMouseDown = useCallback((e: any) => {
    if (!isDM || !currentTool) return;

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    
    if (currentTool === 'reveal') {
      // Добавляем новую видимую область
      const newArea: VisibleArea = {
        id: `area_${Date.now()}`,
        x: pos.x,
        y: pos.y,
        radius: brushSize / 2,
        type: 'circle'
      };
      
      const updatedAreas = [...visibleAreas, newArea];
      setVisibleAreas(updatedAreas);
      onVisibilityChange?.(updatedAreas);
    } else if (currentTool === 'hide') {
      // Удаляем видимые области в радиусе кисти
      const filteredAreas = visibleAreas.filter(area => {
        const distance = Math.sqrt(
          Math.pow(area.x - pos.x, 2) + Math.pow(area.y - pos.y, 2)
        );
        return distance > (brushSize / 2 + area.radius);
      });
      
      setVisibleAreas(filteredAreas);
      onVisibilityChange?.(filteredAreas);
    }
  }, [isDM, currentTool, brushSize, visibleAreas, onVisibilityChange]);

  // Обрабатываем движение мыши во время рисования
  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || !isDM || !currentTool) return;

    const pos = e.target.getStage().getPointerPosition();
    
    if (currentTool === 'reveal') {
      // Добавляем область при движении мыши
      const newArea: VisibleArea = {
        id: `area_${Date.now()}`,
        x: pos.x,
        y: pos.y,
        radius: brushSize / 3, // Меньше для плавного рисования
        type: 'circle'
      };
      
      const updatedAreas = [...visibleAreas, newArea];
      setVisibleAreas(updatedAreas);
      onVisibilityChange?.(updatedAreas);
    }
  }, [isDrawing, isDM, currentTool, brushSize, visibleAreas, onVisibilityChange]);

  // Завершаем рисование
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Очищаем весь туман
  const clearAllFog = useCallback(() => {
    if (!isDM) return;
    
    const fullArea: VisibleArea = {
      id: 'full_map',
      x: 0,
      y: 0,
      type: 'rectangle',
      width,
      height,
      radius: 0
    };
    
    setVisibleAreas([fullArea]);
    onVisibilityChange?.([fullArea]);
  }, [isDM, width, height, onVisibilityChange]);

  // Скрываем всю карту
  const hideAllMap = useCallback(() => {
    if (!isDM) return;
    
    setVisibleAreas([]);
    onVisibilityChange?.([]);
  }, [isDM, onVisibilityChange]);

  // Открываем область вокруг токена
  const revealAroundToken = useCallback((tokenX: number, tokenY: number, radius = 150) => {
    if (!isDM) return;
    
    const newArea: VisibleArea = {
      id: `token_vision_${Date.now()}`,
      x: tokenX,
      y: tokenY,
      radius,
      type: 'circle'
    };
    
    const updatedAreas = [...visibleAreas, newArea];
    setVisibleAreas(updatedAreas);
    onVisibilityChange?.(updatedAreas);
  }, [isDM, visibleAreas, onVisibilityChange]);

  if (!visible) return null;

  return (
    <>
      {/* Инструменты управления туманом для DM */}
      {isDM && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg z-50 space-y-2">
          <div className="text-sm font-medium">Туман войны</div>
          
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-xs ${
                currentTool === 'reveal' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={() => setCurrentTool(currentTool === 'reveal' ? null : 'reveal')}
            >
              Открыть
            </button>
            
            <button
              className={`px-3 py-1 rounded text-xs ${
                currentTool === 'hide' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={() => setCurrentTool(currentTool === 'hide' ? null : 'hide')}
            >
              Скрыть
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs">Размер кисти: {brushSize}px</div>
            <input
              type="range"
              min="50"
              max="300"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
              onClick={clearAllFog}
            >
              Все видно
            </button>
            
            <button
              className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
              onClick={hideAllMap}
            >
              Скрыть все
            </button>
          </div>
        </div>
      )}

      {/* Слой тумана войны */}
      <Layer
        ref={layerRef}
        listening={isDM}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Курсор кисти для DM */}
      {isDM && currentTool && (
        <Circle
          x={0}
          y={0}
          radius={brushSize / 2}
          stroke={currentTool === 'reveal' ? '#22c55e' : '#ef4444'}
          strokeWidth={2}
          dash={[5, 5]}
          opacity={0.7}
          listening={false}
          visible={false} // Будем управлять видимостью через события мыши
        />
      )}
    </>
  );
};

export default FogOfWarLayer;