
import React, { useState, useRef, useEffect } from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import { Initiative, Token } from '@/pages/PlayBattlePage';
import { ZoomIn, ZoomOut, Scale } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EnhancedBattleMapProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  background: string | null;
  setBackground: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  onSelectToken: (id: number | null) => void;
  selectedTokenId: number | null;
  initiative: Initiative[];
  battleActive: boolean;
  fogOfWar?: boolean;
  revealedCells?: { [key: string]: boolean };
  onRevealCell?: (row: number, col: number) => void;
  gridSize?: { rows: number; cols: number };
  gridVisible?: boolean;
  gridOpacity?: number;
}

const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({
  tokens,
  setTokens,
  background,
  setBackground,
  onUpdateTokenPosition,
  onSelectToken,
  selectedTokenId,
  initiative,
  battleActive,
  fogOfWar = false,
  revealedCells = {},
  onRevealCell = () => {},
  gridSize = { rows: 20, cols: 30 },
  gridVisible = true,
  gridOpacity = 0.5,
}) => {
  const [zoom, setZoom] = useState(1);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });

  // Увеличение масштаба
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2.5));
  };

  // Уменьшение масштаба
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  // Сброс масштаба
  const handleResetZoom = () => {
    setZoom(1);
    setMapPosition({ x: 0, y: 0 });
  };
  
  // Функционал перетаскивания карты
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 1) return; // Только средняя кнопка мыши
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };
  
  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setMapPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };
  
  const endDrag = () => {
    setIsDragging(false);
  };

  // Сделать карту больше, чтобы заполнить пространство
  useEffect(() => {
    const container = mapContainerRef.current;
    const content = mapContentRef.current;

    if (container && content && background) {
      // Загрузка изображения для получения его размеров
      const img = new Image();
      img.onload = () => {
        // Рассчитываем размер, чтобы заполнить контейнер
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Установить минимальные размеры карты
        content.style.width = `${Math.max(containerWidth, img.width)}px`;
        content.style.height = `${Math.max(containerHeight, img.height)}px`;
      };
      img.src = background;
    }
  }, [background]);

  return (
    <div className="battle-map-container h-full" ref={mapContainerRef}>
      <div 
        className="map-content zoomable relative" 
        ref={mapContentRef}
        style={{ 
          transform: `scale(${zoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
          transformOrigin: 'center center',
          height: '100%',
          width: '100%'
        }}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <BattleMap
          tokens={tokens}
          setTokens={setTokens}
          background={background}
          setBackground={setBackground}
          onUpdateTokenPosition={onUpdateTokenPosition}
          onSelectToken={onSelectToken}
          selectedTokenId={selectedTokenId}
          initiative={initiative}
          battleActive={battleActive}
        />
        
        {/* Сетка только внутри карты боя */}
        <div className="battle-grid-container absolute inset-0 pointer-events-none">
          <BattleGrid 
            gridSize={gridSize}
            visible={gridVisible}
            opacity={gridOpacity}
          />
          
          <FogOfWar
            gridSize={gridSize}
            revealedCells={revealedCells}
            onRevealCell={onRevealCell}
            active={fogOfWar}
          />
        </div>
      </div>
      
      <div className="zoom-controls absolute bottom-4 right-4 flex gap-2 z-10 bg-background/80 p-2 rounded-lg shadow-lg backdrop-blur">
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleZoomIn} 
          title="Увеличить"
        >
          <ZoomIn size={16} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleZoomOut} 
          title="Уменьшить"
        >
          <ZoomOut size={16} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleResetZoom} 
          title="Сбросить масштаб"
        >
          <Scale size={16} />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedBattleMap;
