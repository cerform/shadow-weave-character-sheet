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
      {/* Слой тумана войны - только Konva элементы */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#000000"
        opacity={isDM ? 0.3 : 0.8}
        listening={isDM}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* Видимые области */}
      {visibleAreas.map(area => (
        area.type === 'circle' ? (
          <Circle
            key={area.id}
            x={area.x}
            y={area.y}
            radius={area.radius}
            fill="#000000"
            globalCompositeOperation="destination-out"
            listening={false}
          />
        ) : (
          <Rect
            key={area.id}
            x={area.x}
            y={area.y}
            width={area.width || brushSize}
            height={area.height || brushSize}
            fill="#000000"
            globalCompositeOperation="destination-out"
            listening={false}
          />
        )
      ))}
    </>
  );
};

export default FogOfWarLayer;