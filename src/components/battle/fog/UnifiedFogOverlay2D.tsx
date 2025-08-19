// src/components/battle/fog/UnifiedFogOverlay2D.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useUnifiedFogStore } from '@/stores/unifiedFogStore';
import { Button } from '@/components/ui/button';
import { Brush, Eraser, Eye, EyeOff, RotateCcw, Square } from 'lucide-react';
import { toast } from 'sonner';

interface UnifiedFogOverlay2DProps {
  enabled?: boolean;
  sessionId?: string;
  mapId?: string;
}

export const UnifiedFogOverlay2D: React.FC<UnifiedFogOverlay2DProps> = ({
  enabled = true,
  sessionId,
  mapId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [brushMode, setBrushMode] = useState<'reveal' | 'hide'>('reveal');
  const [showControls, setShowControls] = useState(true);
  
  const {
    fogGrid,
    isDM,
    isDrawing,
    setIsDrawing,
    brushSize,
    setBrushSize,
    revealArea,
    hideArea,
    revealAll,
    hideAll,
    saveToDatabase
  } = useUnifiedFogStore();

  // Auto-save to database
  useEffect(() => {
    if (sessionId && mapId && fogGrid) {
      const timeoutId = setTimeout(() => {
        saveToDatabase(sessionId, mapId);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [fogGrid, sessionId, mapId, saveToDatabase]);

  // Render fog overlay
  const renderFog = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogGrid || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw fog based on grid state
    for (let x = 0; x < fogGrid.cols; x++) {
      for (let y = 0; y < fogGrid.rows; y++) {
        const opacity = fogGrid.getOpacity(x, y);
        if (opacity <= 0) continue; // Skip fully visible cells
        
        const worldPos = fogGrid.gridToWorld(x, y);
        
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(
          worldPos.x - fogGrid.cellSize / 2,
          worldPos.y - fogGrid.cellSize / 2,
          fogGrid.cellSize,
          fogGrid.cellSize
        );
      }
    }
  }, [fogGrid, enabled]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      renderFog();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (enabled) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderFog, enabled]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || !enabled) return;
    setIsDrawing(true);
    handleDraw(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || !enabled || !isDrawing) return;
    handleDraw(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (brushMode === 'reveal') {
      revealArea(x, y);
    } else {
      hideArea(x, y);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDM || !enabled) return;
      
      if (e.ctrlKey) setBrushMode('reveal');
      else if (e.altKey) setBrushMode('hide');
      
      if (e.key === '+' || e.key === '=') {
        setBrushSize(brushSize + 10);
      } else if (e.key === '-') {
        setBrushSize(brushSize - 10);
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
  }, [isDM, enabled, brushSize, setBrushSize]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Fog Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isDM ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ 
          cursor: isDM ? (isDrawing ? 'none' : brushMode === 'reveal' ? 'crosshair' : 'cell') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* DM Controls */}
      {isDM && showControls && (
        <div className="absolute top-4 right-4 pointer-events-auto z-50">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Туман Войны 2D</h3>
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
                min="50"
                max="300"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                revealAll();
                toast.success('Весь туман снят');
              }} className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                Все
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                hideAll();
                toast.success('Туман восстановлен');
              }} className="flex-1">
                <EyeOff className="w-3 h-3 mr-1" />
                Скрыть
              </Button>
            </div>

            {/* Help */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
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
          🌫️ Туман 2D
        </Button>
      )}
    </div>
  );
};