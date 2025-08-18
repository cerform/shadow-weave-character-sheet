import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brush, Eraser, RotateCcw, Square, Move, Paintbrush2 } from 'lucide-react';
import { toast } from 'sonner';

interface FogModeManagerProps {
  onModeChange: (mode: 'map' | 'fog') => void;
  currentMode: 'map' | 'fog';
  enabled: boolean;
}

export default function FogModeManager({ 
  onModeChange, 
  currentMode, 
  enabled 
}: FogModeManagerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'reveal' | 'hide'>('reveal');
  const [brushSize, setBrushSize] = useState(60);
  const [showControls, setShowControls] = useState(true);

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || currentMode !== 'fog') return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [enabled, currentMode]);

  // Рисование на canvas
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || currentMode !== 'fog' || !enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (brushMode === 'reveal') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    }

    // Мягкая кисть
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
    if (brushMode === 'reveal') {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode !== 'fog' || !enabled) return;
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = () => setDrawing(false);

  const clearAllFog = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      toast.success('Туман полностью очищен');
    }
  };

  const resetAllFog = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast.success('Туман восстановлен');
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Fog Canvas - отображается только в режиме тумана */}
      {currentMode === 'fog' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto z-40"
          style={{ 
            cursor: drawing ? 'none' : (brushMode === 'reveal' ? 'crosshair' : 'cell')
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      )}

      {/* Mode Controls */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 p-3 rounded-xl backdrop-blur">
        <h3 className="text-yellow-400 font-bold text-sm mb-3">Режим Работы</h3>
        
        {/* Mode Switcher */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant={currentMode === 'map' ? 'default' : 'outline'}
            onClick={() => {
              onModeChange('map');
              toast.success('Режим карты: перемещение и масштаб');
            }}
            className="flex-1"
          >
            <Move className="w-3 h-3 mr-1" />
            Карта
          </Button>
          <Button
            size="sm"
            variant={currentMode === 'fog' ? 'default' : 'outline'}
            onClick={() => {
              onModeChange('fog');
              toast.success('Режим тумана: рисование');
            }}
            className="flex-1"
          >
            <Paintbrush2 className="w-3 h-3 mr-1" />
            Туман
          </Button>
        </div>

        {/* Fog Controls - показываются только в режиме тумана */}
        {currentMode === 'fog' && (
          <>
            {/* Brush Mode */}
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={brushMode === 'reveal' ? 'default' : 'outline'}
                onClick={() => setBrushMode('reveal')}
                className="flex-1"
              >
                <Brush className="w-3 h-3 mr-1" />
                Открыть
              </Button>
              <Button
                size="sm"
                variant={brushMode === 'hide' ? 'default' : 'outline'}
                onClick={() => setBrushMode('hide')}
                className="flex-1"
              >
                <Eraser className="w-3 h-3 mr-1" />
                Скрыть
              </Button>
            </div>

            {/* Brush Size */}
            <div className="mb-3">
              <label className="text-xs text-gray-300 block mb-1">
                Размер кисти: {brushSize}px
              </label>
              <input
                type="range"
                min="20"
                max="150"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-3">
              <Button size="sm" variant="outline" onClick={clearAllFog} className="flex-1">
                <Square className="w-3 h-3 mr-1" />
                Очистить
              </Button>
              <Button size="sm" variant="outline" onClick={resetAllFog} className="flex-1">
                <RotateCcw className="w-3 h-3 mr-1" />
                Сбросить
              </Button>
            </div>
          </>
        )}

        {/* Help */}
        <div className="text-xs text-gray-400 space-y-1">
          {currentMode === 'map' ? (
            <>
              <div>🖱️ Drag: перемещение карты</div>
              <div>🎱 Wheel: масштабирование</div>
            </>
          ) : (
            <>
              <div>🖌️ ЛКМ: рисовать кистью</div>
              <div>📏 Shift+ЛКМ: переключить режим</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}