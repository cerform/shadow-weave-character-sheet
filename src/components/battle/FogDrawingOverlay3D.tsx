import React, { useEffect, useState } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogDrawingOverlay3DProps {
  canvasElement?: HTMLCanvasElement;
}

export const FogDrawingOverlay3D: React.FC<FogDrawingOverlay3DProps> = ({ 
  canvasElement 
}) => {
  const {
    fogSettings,
    activeMode,
    isDrawingMode,
    isDM,
    isDrawing,
    isPanning,
    setIsDrawing,
    setIsPanning,
    drawVisibleArea,
    hideVisibleArea
  } = useFogOfWarStore();

  const [keyPressed, setKeyPressed] = useState<{ shift: boolean; alt: boolean; ctrl: boolean }>({ 
    shift: false, 
    alt: false, 
    ctrl: false 
  });

  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyPressed(prev => ({ ...prev, shift: true }));
      } else if (e.key === 'Alt') {
        e.preventDefault();
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

    if (isDM && fogSettings.enabled && activeMode === 'fog') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDM, fogSettings.enabled, activeMode]);

  // Обработчики мыши для 3D
  useEffect(() => {
    if (!canvasElement || !isDM || activeMode !== 'fog') return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      
      if (keyPressed.ctrl) {
        setIsPanning(true);
        return;
      }
      
      if (isDrawingMode || keyPressed.shift || keyPressed.alt) {
        setIsDrawing(true);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      setIsPanning(false);
    };

    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasElement, isDM, activeMode, isDrawingMode, keyPressed, setIsDrawing, setIsPanning]);

  if (!fogSettings.enabled || !isDM || activeMode !== 'fog') {
    return null;
  }

  return (
    <div className="pointer-events-none">
      {/* Keyboard shortcuts instructions */}
      {(keyPressed.shift || keyPressed.alt || keyPressed.ctrl) && (
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm z-50">
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
        <div className="absolute top-4 left-4 bg-background/90 border rounded-lg p-3 text-sm z-50">
          <div className="font-medium mb-1">Режим рисования (3D)</div>
          <div className="text-muted-foreground space-y-1">
            <div>Нажмите и ведите мышью чтобы открыть области видимости</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift</kbd> + клик - открыть область
            </div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Alt</kbd> + клик - скрыть область
            </div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> - переместить туман
            </div>
          </div>
        </div>
      )}
      
      {/* Mode indicator */}
      <div className="absolute bottom-4 right-4 bg-background/90 border rounded-lg p-2 text-xs z-50">
        <div className="font-medium">
          Режим: 🌫️ Туман (3D)
        </div>
      </div>
    </div>
  );
};