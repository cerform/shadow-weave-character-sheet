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
    fogTransform,
    isDrawingMode,
    isDM,
    isDrawing,
    isPanning,
    setIsDrawing,
    setIsPanning,
    setFogTransform,
    drawVisibleArea,
    hideVisibleArea
  } = useFogOfWarStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [keyPressed, setKeyPressed] = useState<{ shift: boolean; alt: boolean; ctrl: boolean }>({ shift: false, alt: false, ctrl: false });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyPressed(prev => ({ ...prev, shift: true }));
      } else if (e.key === 'Alt') {
        e.preventDefault(); // Предотвращаем открытие меню
        setKeyPressed(prev => ({ ...prev, alt: true }));
      } else if (e.key === 'Control') {
        setKeyPressed(prev => ({ ...prev, ctrl: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyPressed(prev => ({ ...prev, shift: false }));
      } else if (e.key === 'Alt') {
        setKeyPressed(prev => ({ ...prev, alt: false }));
      } else if (e.key === 'Control') {
        setKeyPressed(prev => ({ ...prev, ctrl: false }));
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
    setLastMousePos({ x: e.clientX, y: e.clientY });
    
    // Ctrl + Клик = режим перемещения тумана
    if (keyPressed.ctrl) {
      setIsPanning(true);
      return;
    }
    
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
  }, [isDM, isDrawingMode, keyPressed, getMapCoordinates, drawVisibleArea, hideVisibleArea, setIsDrawing, setIsPanning]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getMapCoordinates(e.clientX, e.clientY);
    setMousePos({ x: x * scale, y: y * scale });

    if (!isDM) return;
    
    // Перемещение тумана
    if (isPanning && keyPressed.ctrl) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setFogTransform({
        offsetX: fogTransform.offsetX + deltaX,
        offsetY: fogTransform.offsetY + deltaY
      });
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Рисование видимых областей
    if (isDrawing && isDrawingMode) {
      const mapCoords = getMapCoordinates(e.clientX, e.clientY);
      drawVisibleArea(mapCoords.x, mapCoords.y);
    }
  }, [isDM, isDrawingMode, isDrawing, isPanning, keyPressed.ctrl, fogTransform, getMapCoordinates, drawVisibleArea, scale, lastMousePos, setFogTransform]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsPanning(false);
  }, [setIsDrawing, setIsPanning]);

  if (!fogSettings.enabled || !isDM) {
    return null;
  }

  // Определяем курсор в зависимости от режима и нажатых клавиш
  const getCursor = () => {
    if (keyPressed.ctrl) return isPanning ? 'grabbing' : 'grab'; // Перемещение тумана
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
      {(isDrawingMode || keyPressed.shift || keyPressed.alt || keyPressed.ctrl) && (
        <div
          className={`absolute pointer-events-none border-2 rounded-full ${
            keyPressed.alt 
              ? 'border-red-500/70 bg-red-500/10' 
              : keyPressed.ctrl
              ? 'border-blue-500/70 bg-blue-500/10'
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
      {(keyPressed.shift || keyPressed.alt || keyPressed.ctrl) && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">
            {keyPressed.shift && 'Открыть область'}
            {keyPressed.alt && 'Скрыть область'}
            {keyPressed.ctrl && 'Переместить туман'}
          </div>
          <div className="text-muted-foreground">
            {keyPressed.shift && 'Нажмите на карту чтобы открыть область'}
            {keyPressed.alt && 'Нажмите на карту чтобы скрыть область'}
            {keyPressed.ctrl && 'Нажмите и ведите мышью чтобы переместить туман'}
          </div>
        </div>
      )}

      {/* Drawing instructions */}
      {isDrawingMode && !keyPressed.shift && !keyPressed.alt && !keyPressed.ctrl && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm pointer-events-none">
          <div className="font-medium mb-1">Режим рисования</div>
          <div className="text-muted-foreground space-y-1">
            <div>Нажмите и ведите мышью чтобы открыть области видимости</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> - переместить туман
            </div>
          </div>
        </div>
      )}
    </div>
  );
};