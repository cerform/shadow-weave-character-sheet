import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Move, Paintbrush2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import InteractiveFogOfWar from './InteractiveFogOfWar';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface Simple2DCanvasMapProps {
  assets3D?: any[];
  tokens?: any[];
  mapImageUrl?: string;
  fogEnabled?: boolean;
  sessionId?: string;
  mapId?: string;
  isDM?: boolean;
}

const Simple2DCanvasMap: React.FC<Simple2DCanvasMapProps> = ({
  assets3D = [],
  tokens = [],
  mapImageUrl = '',
  fogEnabled = false,
  sessionId = 'default-session',
  mapId = 'current-map',
  isDM = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fog of War store
  const { 
    activeMode, 
    setActiveMode, 
    setFogTransform, 
    fogTransform,
    setIsDM,
    initializeSync,
    loadFogFromDatabase
  } = useFogOfWarStore();
  
  // Map interaction state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Mode state (synced with store)
  const [currentMode, setCurrentMode] = useState<'map' | 'fog'>(activeMode);
  const [showGrid, setShowGrid] = useState(true);

  // Image loading
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize fog of war
  useEffect(() => {
    setIsDM(isDM);
    if (sessionId && fogEnabled) {
      initializeSync(sessionId);
      loadFogFromDatabase(sessionId, mapId);
    }
  }, [isDM, sessionId, mapId, fogEnabled, setIsDM, initializeSync, loadFogFromDatabase]);

  // Sync transform with store
  useEffect(() => {
    setFogTransform({
      offsetX: offset.x,
      offsetY: offset.y,
      scale: scale
    });
  }, [offset, scale, setFogTransform]);

  // Sync mode with store
  useEffect(() => {
    setCurrentMode(activeMode);
  }, [activeMode]);

  // Load map image
  useEffect(() => {
    if (mapImageUrl) {
      const img = new Image();
      img.onload = () => {
        setMapImage(img);
        setMapLoaded(true);
        redrawCanvas();
      };
      img.onerror = () => {
        console.error('Failed to load map image:', mapImageUrl);
        setMapLoaded(false);
      };
      img.src = mapImageUrl;
    } else {
      setMapImage(null);
      setMapLoaded(false);
      redrawCanvas();
    }
  }, [mapImageUrl]);

  // Redraw canvas function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(offset.x + canvas.width / 2, offset.y + canvas.height / 2);
    ctx.scale(scale, scale);

    // Draw map image if loaded
    if (mapImage && mapLoaded) {
      const imgWidth = 800;
      const imgHeight = 600;
      ctx.drawImage(mapImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1 / scale;
      const gridSize = 50;
      const startX = Math.floor(-canvas.width / 2 / scale / gridSize) * gridSize;
      const endX = Math.ceil(canvas.width / 2 / scale / gridSize) * gridSize;
      const startY = Math.floor(-canvas.height / 2 / scale / gridSize) * gridSize;
      const endY = Math.ceil(canvas.height / 2 / scale / gridSize) * gridSize;

      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }

      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    // Draw tokens (simplified representation)
    tokens.forEach((token, index) => {
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(token.x || index * 60, token.y || index * 60, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Token name
      ctx.fillStyle = 'white';
      ctx.font = `${12 / scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(token.name || `Token ${index + 1}`, token.x || index * 60, (token.y || index * 60) + 35);
    });

    ctx.restore();
  }, [mapImage, mapLoaded, offset, scale, showGrid, tokens]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  // Redraw when dependencies change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Mouse event handlers for map interaction
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (currentMode !== 'map') return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [currentMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (currentMode !== 'map' || !isDragging) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastPanPoint, currentMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (currentMode !== 'map') return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, [currentMode]);

  // Toggle mode
  const toggleMode = () => {
    const newMode = currentMode === 'map' ? 'fog' : 'map';
    setActiveMode(newMode); // Update store
    setCurrentMode(newMode); // Update local state
    toast.success(newMode === 'map' ? 'Режим карты активирован' : 'Режим тумана активирован');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-800">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-50 bg-background/90 border border-border p-4 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="flex flex-col gap-3">
          <Button
            onClick={toggleMode}
            variant={currentMode === 'fog' ? 'default' : 'outline'}
            size="sm"
            className="justify-start"
          >
            {currentMode === 'fog' ? <Paintbrush2 className="w-4 h-4 mr-2" /> : <Move className="w-4 h-4 mr-2" />}
            {currentMode === 'fog' ? 'Туман' : 'Карта'}
          </Button>
          
          <Button
            onClick={() => setShowGrid(!showGrid)}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            {showGrid ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            Сетка
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
            <div className="font-medium">Масштаб: {Math.round(scale * 100)}%</div>
            {currentMode === 'map' ? (
              <div className="space-y-1">
                <div>🖱️ Drag: перемещение</div>
                <div>🎱 Wheel: масштаб</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div>🖌️ ЛКМ: рисовать туман</div>
                <div>🧽 Shift: стирать туман</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: currentMode === 'map' ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            pointerEvents: currentMode === 'map' ? 'auto' : 'none'
          }}
        />
      </div>

      {/* Interactive Fog of War - только когда туман включен и режим "fog" */}
      {fogEnabled && currentMode === 'fog' && (
        <InteractiveFogOfWar
          isDM={isDM}
          enabled={true}
          sessionId={sessionId}
          mapId={mapId}
          onFogUpdate={(data) => console.log('Fog updated:', data)}
        />
      )}

      {/* Status Info */}
      <div className="absolute bottom-4 right-4 z-50 bg-background/80 border border-border p-3 rounded-lg backdrop-blur-sm shadow-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Режим: {currentMode === 'map' ? 'Карта' : 'Туман'}</div>
          <div>Токенов: {tokens.length}</div>
          <div>Ассетов: {assets3D.length}</div>
          {mapImageUrl && <div className="text-primary">Карта: загружена</div>}
        </div>
      </div>
    </div>
  );
};

export default Simple2DCanvasMap;