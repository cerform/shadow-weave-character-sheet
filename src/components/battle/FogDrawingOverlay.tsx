import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogDrawingOverlayProps {
  mapWidth: number;
  mapHeight: number;
  scale?: number;
}

export const FogDrawingOverlay: React.FC<FogDrawingOverlayProps> = ({ 
  mapWidth, 
  mapHeight, 
  scale = 1 
}) => {
  const {
    visibleAreas,
    fogSettings,
    isDrawingMode,
    isDM,
    isDrawing,
    setIsDrawing,
    drawVisibleArea,
    hideVisibleArea
  } = useFogOfWarStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [keyPressed, setKeyPressed] = useState<{ shift: boolean; alt: boolean }>({ shift: false, alt: false });

  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyPressed(prev => ({ ...prev, shift: true }));
      } else if (e.key === 'Alt') {
        e.preventDefault(); // Предотвращаем открытие меню
        setKeyPressed(prev => ({ ...prev, alt: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyPressed(prev => ({ ...prev, shift: false }));
      } else if (e.key === 'Alt') {
        setKeyPressed(prev => ({ ...prev, alt: false }));
      }
    };

    if (isDM && fogSettings.enabled) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDM, fogSettings.enabled]);

  const getMapCoordinates = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    
    return { x, y };
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDM) return;
    
    e.preventDefault();
    const { x, y } = getMapCoordinates(e.clientX, e.clientY);
    
    // Shift + Клик = открыть область
    if (keyPressed.shift) {
      drawVisibleArea(x, y);
      return;
    }
    
    // Alt + Клик = скрыть область
    if (keyPressed.alt) {
      hideVisibleArea(x, y);
      return;
    }
    
    // Обычное рисование только в режиме рисования
    if (isDrawingMode) {
      setIsDrawing(true);
      drawVisibleArea(x, y);
    }
  }, [isDM, isDrawingMode, keyPressed, getMapCoordinates, drawVisibleArea, hideVisibleArea, setIsDrawing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getMapCoordinates(e.clientX, e.clientY);
    setMousePos({ x: x * scale, y: y * scale });

    if (!isDM || !isDrawing || !isDrawingMode) return;
    
    const mapCoords = getMapCoordinates(e.clientX, e.clientY);
    drawVisibleArea(mapCoords.x, mapCoords.y);
  }, [isDM, isDrawingMode, isDrawing, getMapCoordinates, drawVisibleArea, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, [setIsDrawing]);

  if (!fogSettings.enabled || !isDM) {
    return null;
  }

  // Определяем курсор в зависимости от режима и нажатых клавиш
  const getCursor = () => {
    if (keyPressed.shift) return 'copy'; // Открыть область
    if (keyPressed.alt) return 'not-allowed'; // Скрыть область
    if (isDrawingMode) return 'crosshair';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30"
      style={{
        width: mapWidth * scale,
        height: mapHeight * scale,
        cursor: getCursor(),
        pointerEvents: 'auto' // Всегда включаем для клавиатурных сочетаний
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Brush cursor preview */}
      {(isDrawingMode || keyPressed.shift || keyPressed.alt) && (
        <div
          className={`absolute pointer-events-none border-2 rounded-full ${
            keyPressed.alt 
              ? 'border-red-500/70 bg-red-500/10' 
              : 'border-primary/50 bg-primary/10'
          }`}
          style={{
            left: mousePos.x - (fogSettings.brushSize * scale) / 2,
            top: mousePos.y - (fogSettings.brushSize * scale) / 2,
            width: fogSettings.brushSize * scale,
            height: fogSettings.brushSize * scale
          }}
        />
      )}

      {/* Keyboard shortcuts instructions */}
      {(keyPressed.shift || keyPressed.alt) && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">
            {keyPressed.shift && 'Открыть область'}
            {keyPressed.alt && 'Скрыть область'}
          </div>
          <div className="text-muted-foreground">
            Нажмите на карту чтобы {keyPressed.shift ? 'открыть' : 'скрыть'} область
          </div>
        </div>
      )}

      {/* Drawing instructions */}
      {isDrawingMode && !keyPressed.shift && !keyPressed.alt && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">Режим рисования</div>
          <div className="text-muted-foreground">
            Нажмите и ведите мышью чтобы открыть области видимости
          </div>
        </div>
      )}
    </div>
  );
};