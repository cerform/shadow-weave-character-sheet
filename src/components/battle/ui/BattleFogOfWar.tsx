import { useEffect, useRef, useState, useMemo } from "react";
import { useBattleUIStore } from "@/stores/battleUIStore";
import { useFogOfWarStore } from "@/stores/fogOfWarStore";
import { Button } from "@/components/ui/button";
import { Brush, Eraser } from "lucide-react";

interface FogCanvasProps {
  isDM?: boolean;
  brushSize?: number;
  sessionId?: string;
  mapId?: string;
}

export default function BattleFogOfWar({ 
  isDM = false, 
  brushSize = 60,
  sessionId = 'default-session',
  mapId = 'default-map'
}: FogCanvasProps) {
  const fogEnabled = useBattleUIStore((s) => s.fogEnabled);
  
  // Используем общий store тумана войны для синхронизации
  const { 
    fogSettings, 
    visibleAreas, 
    drawVisibleArea, 
    hideVisibleArea,
    getFogOpacityAtPosition,
    loadFogFromDatabase,
    saveFogToDatabase
  } = useFogOfWarStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'reveal' | 'hide'>('reveal');
  const [currentBrushSize, setCurrentBrushSize] = useState(brushSize);

  // Загружаем туман из базы данных при инициализации
  useEffect(() => {
    loadFogFromDatabase(sessionId, mapId);
  }, [sessionId, mapId, loadFogFromDatabase]);

  // Автосохранение изменений в базу данных
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFogToDatabase(sessionId, mapId);
    }, 1000); // Сохраняем через 1 секунду после последнего изменения

    return () => clearTimeout(timeoutId);
  }, [visibleAreas, sessionId, mapId, saveFogToDatabase]);

  // Обновляем canvas при изменении видимых областей
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogSettings.enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      redrawFog();
    };

    const redrawFog = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Создаем маску тумана
      const imageData = ctx.createImageData(rect.width, rect.height);
      const data = imageData.data;
      
      for (let x = 0; x < rect.width; x++) {
        for (let y = 0; y < rect.height; y++) {
          const opacity = getFogOpacityAtPosition(x, y);
          const index = (y * rect.width + x) * 4;
          
          data[index] = 0;     // R
          data[index + 1] = 0; // G  
          data[index + 2] = 0; // B
          data[index + 3] = opacity * 255; // A
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [fogSettings.enabled, visibleAreas, getFogOpacityAtPosition]);

  // Обработка рисования тумана
  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDM || !fogSettings.enabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (brushMode === 'reveal') {
      drawVisibleArea(x, y);
    } else {
      hideVisibleArea(x, y);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || !fogSettings.enabled) return;
    setDrawing(true);
    handleDrawing(e);
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  // Очистить весь туман
  const clearAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  // Восстановить весь туман
  const resetFog = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  if (!fogSettings.enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Canvas маска тумана */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isDM ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ 
          cursor: isDM ? (drawing ? 'none' : brushMode === 'reveal' ? 'crosshair' : 'grab') : 'default',
          mixBlendMode: 'multiply'
        }}
        onMouseDown={startDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* Кисть-индикатор */}
      {isDM && drawing && (
        <div 
          className="absolute pointer-events-none rounded-full border-2 border-yellow-400"
          style={{
            width: currentBrushSize * 2,
            height: currentBrushSize * 2,
            transform: 'translate(-50%, -50%)',
            left: 0,
            top: 0,
            opacity: 0.7
          }}
        />
      )}

      {/* DM контролы */}
      {isDM && (
        <div className="absolute top-4 left-4 pointer-events-auto z-50">
          <div className="bg-black/70 p-3 rounded-xl backdrop-blur">
            <h3 className="text-yellow-400 font-bold text-sm mb-2">Туман Войны</h3>
            
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={brushMode === 'reveal' ? 'default' : 'outline'}
                onClick={() => setBrushMode('reveal')}
                className="text-xs"
              >
                <Brush className="w-3 h-3 mr-1" />
                Открыть
              </Button>
              <Button
                size="sm"
                variant={brushMode === 'hide' ? 'default' : 'outline'}
                onClick={() => setBrushMode('hide')}
                className="text-xs"
              >
                <Eraser className="w-3 h-3 mr-1" />
                Скрыть
              </Button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-300 block mb-1">Размер кисти</label>
              <input
                type="range"
                min="20"
                max="120"
                value={currentBrushSize}
                onChange={(e) => setCurrentBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{currentBrushSize}px</span>
            </div>

            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={clearAll} className="text-xs">
                Очистить всё
              </Button>
              <Button size="sm" variant="outline" onClick={resetFog} className="text-xs">
                Сбросить
              </Button>
            </div>

            <div className="mt-2 text-xs text-gray-400">
              ЛКМ: рисовать | Ctrl: открыть | Alt: скрыть
            </div>
          </div>
        </div>
      )}
    </div>
  );
}