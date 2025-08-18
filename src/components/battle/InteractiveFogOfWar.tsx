import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Brush, Eraser, RotateCcw, Square } from "lucide-react";

interface InteractiveFogOfWarProps {
  isDM?: boolean;
  enabled?: boolean;
  onFogUpdate?: (fogData: string) => void;
}

export default function InteractiveFogOfWar({ 
  isDM = false, 
  enabled = true,
  onFogUpdate 
}: InteractiveFogOfWarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'reveal' | 'hide'>('reveal');
  const [brushSize, setBrushSize] = useState(60);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Заполняем черным (туман)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [enabled]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDM || !enabled) return;
      
      if (e.ctrlKey) setBrushMode('reveal');
      else if (e.altKey) setBrushMode('hide');
      
      // Изменение размера кисти
      if (e.key === '+' || e.key === '=') {
        setBrushSize(prev => Math.min(150, prev + 10));
      } else if (e.key === '-') {
        setBrushSize(prev => Math.max(20, prev - 10));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.altKey) {
        setBrushMode('reveal');
      }
    };

    if (isDM) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDM, enabled]);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDM || !enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Настройка операции рисования
    if (brushMode === 'reveal') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    }

    // Рисуем мягкую кисть
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
    if (brushMode === 'reveal') {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Отправляем обновление
    if (onFogUpdate) {
      onFogUpdate(canvas.toDataURL());
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || !enabled) return;
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = () => setDrawing(false);

  const updateMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    draw(e);
  };

  const clearAllFog = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onFogUpdate) onFogUpdate(canvas.toDataURL());
    }
  };

  const resetAllFog = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (onFogUpdate) onFogUpdate(canvas.toDataURL());
    }
  };

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Fog Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isDM ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ 
          cursor: isDM ? (drawing ? 'none' : brushMode === 'reveal' ? 'crosshair' : 'cell') : 'default'
        }}
        onMouseDown={startDrawing}
        onMouseMove={updateMousePosition}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* Brush Cursor */}
      {isDM && (
        <div 
          className="absolute pointer-events-none rounded-full border-2 border-yellow-400/60"
          style={{
            width: brushSize * 2,
            height: brushSize * 2,
            left: mousePos.x - brushSize,
            top: mousePos.y - brushSize,
            display: drawing ? 'none' : 'block',
            background: brushMode === 'reveal' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
          }}
        />
      )}

      {/* DM Controls */}
      {isDM && showControls && (
        <div className="absolute top-4 right-4 pointer-events-auto z-50">
          <div className="bg-background/90 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Туман Войны</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowControls(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            {/* Brush Mode */}
            <div className="flex gap-2">
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
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
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
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearAllFog} className="flex-1">
                <Square className="w-3 h-3 mr-1" />
                Очистить
              </Button>
              <Button size="sm" variant="outline" onClick={resetAllFog} className="flex-1">
                <RotateCcw className="w-3 h-3 mr-1" />
                Сбросить
              </Button>
            </div>

            {/* Help */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Ctrl + ЛКМ: Открыть область</div>
              <div>Alt + ЛКМ: Скрыть область</div>
              <div>+/- : Изменить размер кисти</div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Control Button */}
      {isDM && !showControls && (
        <Button
          size="sm"
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 pointer-events-auto z-50"
        >
          🌫️ Туман
        </Button>
      )}
    </div>
  );
}