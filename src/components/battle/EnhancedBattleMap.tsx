
import React, { useState, useRef, useEffect } from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import { Initiative, Token } from '@/pages/PlayBattlePage';
import { ZoomIn, ZoomOut, Scale } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

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
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

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
  
  // Улучшенный функционал перетаскивания карты - теперь работает с правой кнопкой мыши или через зажатие пробела
  const handleMouseDown = (e: React.MouseEvent) => {
    // Средняя кнопка мыши или правая
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
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
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем обработчик клавиши пробел для входа в режим перетаскивания
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isDragging) {
        // Включаем режим перетаскивания при нажатии пробела
        document.body.style.cursor = 'grab';
        const container = mapContainerRef.current;
        if (container) {
          container.style.cursor = 'grab';
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Выключаем режим перетаскивания при отпускании пробела
        document.body.style.cursor = 'default';
        const container = mapContainerRef.current;
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDragging]);

  // Улучшаем обработку контекстного меню для перетаскивания правой кнопкой мыши
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Предотвращаем появление контекстного меню при перетаскивании карты
      if (isDragging || mapContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isDragging]);

  // Сделать карту больше, чтобы заполнить пространство и обеспечить полноценный скроллинг
  useEffect(() => {
    const container = mapContainerRef.current;
    const content = mapContentRef.current;

    if (container && content && background) {
      // Загрузка изображения для получения его размеров
      const img = new Image();
      img.onload = () => {
        // Установить минимальные размеры карты, учитывая размер контейнера и изображения
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        content.style.width = `${Math.max(containerWidth, img.width * 1.2)}px`;
        content.style.height = `${Math.max(containerHeight, img.height * 1.2)}px`;
      };
      img.src = background;
    }
  }, [background]);

  return (
    <div 
      className="battle-map-container h-full relative" 
      ref={mapContainerRef}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        className="map-content zoomable relative overflow-hidden" 
        ref={mapContentRef}
        style={{ 
          transform: `scale(${zoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
          transformOrigin: 'center center',
          height: '100%',
          width: '100%',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
        {gridVisible && (
          <div className="battle-grid-container absolute inset-0 pointer-events-none">
            <BattleGrid 
              gridSize={gridSize}
              visible={true}
              opacity={gridOpacity}
            />
          </div>
        )}
          
        {/* Туман войны как отдельный слой */}
        {fogOfWar && (
          <div className="fog-of-war-container absolute inset-0 pointer-events-none">
            <FogOfWar
              gridSize={gridSize}
              revealedCells={revealedCells}
              onRevealCell={onRevealCell}
              active={fogOfWar}
            />
          </div>
        )}
      </div>
      
      {/* Улучшенная панель управления картой */}
      <div className="zoom-controls absolute bottom-4 right-4 flex gap-2 z-10 bg-background/80 p-2 rounded-lg shadow-lg backdrop-blur">
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleZoomIn} 
          title="Увеличить"
          style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
        >
          <ZoomIn size={16} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleZoomOut} 
          title="Уменьшить"
          style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
        >
          <ZoomOut size={16} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={handleResetZoom} 
          title="Сбросить масштаб"
          style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
        >
          <Scale size={16} />
        </Button>
      </div>
      
      {/* Подсказка о перетаскивании */}
      <div className="absolute top-4 left-4 bg-background/70 p-2 rounded text-xs z-10 backdrop-blur-sm">
        Используйте среднюю кнопку мыши, правую кнопку, или Ctrl+ЛКМ для перемещения карты
      </div>
    </div>
  );
};

export default EnhancedBattleMap;
