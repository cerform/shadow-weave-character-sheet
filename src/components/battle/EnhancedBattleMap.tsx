
import React, { useState, useRef, useEffect } from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Token, Initiative } from '@/stores/battleStore';
import { LightSource } from '@/types/battle';

interface EnhancedBattleMapProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>> | ((newToken: Token) => void);
  background: string | null;
  setBackground: (url: string | null) => void;
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
  zoom?: number;
  isDM?: boolean;
  lightSources?: LightSource[];
  isDynamicLighting?: boolean;
  className?: string;
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
  zoom = 1,
  isDM = true,
  lightSources = [],
  isDynamicLighting = false,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [spacePressed, setSpacePressed] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && (spacePressed || e.ctrlKey))) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      
      if (mapContentRef.current) {
        mapContentRef.current.classList.add('grabbing');
      }
      document.body.classList.add('grabbing');
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
    if (isDragging) {
      setIsDragging(false);
      
      if (mapContentRef.current) {
        mapContentRef.current.classList.remove('grabbing');
      }
      document.body.classList.remove('grabbing');
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey && isDM) {
      e.preventDefault();
      if (mapContainerRef.current && mapContentRef.current) {
        const container = mapContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - container.left;
        const mouseY = e.clientY - container.top;
        
        setMapPosition(prev => {
          const dx = mouseX - container.width / 2;
          const dy = mouseY - container.height / 2;
          
          return {
            x: prev.x - dx * 0.1,
            y: prev.y - dy * 0.1
          };
        });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed) {
        setSpacePressed(true);
        document.body.style.cursor = 'grab';
        const container = mapContainerRef.current;
        if (container) {
          container.style.cursor = 'grab';
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        document.body.style.cursor = 'default';
        const container = mapContainerRef.current;
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const container = mapContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [spacePressed, isDM]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isDragging || mapContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isDragging]);

  // Обработчик загрузки изображения для правильного масштабирования
  useEffect(() => {
    if (!background) return;
    
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // Центрируем карту после загрузки изображения
      const container = mapContainerRef.current;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Вычисляем соотношение сторон контейнера и изображения
        const containerRatio = containerWidth / containerHeight;
        const imgRatio = img.width / img.height;
        
        let scaledWidth, scaledHeight;
        
        // Масштабируем изображение, сохраняя соотношение сторон
        if (containerRatio > imgRatio) {
          // Контейнер шире, чем изображение
          scaledHeight = containerHeight * zoom;
          scaledWidth = scaledHeight * imgRatio;
        } else {
          // Изображение шире, чем контейнер
          scaledWidth = containerWidth * zoom;
          scaledHeight = scaledWidth / imgRatio;
        }
        
        // Центрируем изображение
        setMapPosition({
          x: (containerWidth - scaledWidth) / 2,
          y: (containerHeight - scaledHeight) / 2
        });
      }
    };
    img.src = background;
  }, [background, zoom]);

  const centerMap = () => {
    if (!background || !mapContainerRef.current) return;
    
    const container = mapContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Если у нас есть размеры изображения, используем их
    if (imageSize.width > 0 && imageSize.height > 0) {
      // Вычисляем соотношение сторон контейнера и изображения
      const containerRatio = containerWidth / containerHeight;
      const imgRatio = imageSize.width / imageSize.height;
      
      let scaledWidth, scaledHeight;
      
      // Масштабируем изображение, сохраняя соотношение сторон
      if (containerRatio > imgRatio) {
        // Контейнер шире, чем изображение
        scaledHeight = containerHeight * zoom;
        scaledWidth = scaledHeight * imgRatio;
      } else {
        // Изображение шире, чем контейнер
        scaledWidth = containerWidth * zoom;
        scaledHeight = scaledWidth / imgRatio;
      }
      
      // Центрируем изображение
      setMapPosition({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2
      });
    } else {
      // Если размеры изображения неизвестны, просто центрируем содержимое
      setMapPosition({
        x: (containerWidth - containerWidth * zoom) / 2,
        y: (containerHeight - containerHeight * zoom) / 2
      });
    }
  };

  // Центрируем карту при изменении масштаба
  useEffect(() => {
    centerMap();
  }, [zoom]);

  // Получаем позиции токенов для fog of war и освещения
  const tokenPositions = tokens.map(token => ({
    id: token.id,
    x: token.x,
    y: token.y,
    visible: token.visible,
    type: token.type
  }));

  // Обновляем источники света, прикрепленные к токенам
  const updatedLightSources = [...lightSources].map(light => {
    if (light.attachedToTokenId) {
      const token = tokens.find(t => t.id === light.attachedToTokenId);
      if (token) {
        return { ...light, x: token.x, y: token.y };
      }
    }
    return light;
  });
  
  // Вычисляем размер контента карты на основе размера изображения
  const contentStyle = background && imageSize.width > 0 && imageSize.height > 0
    ? {
        width: `${imageSize.width}px`,
        height: `${imageSize.height}px`,
        backgroundImage: `url(${background})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        width: '100%',
        height: '100%',
      };

  return (
    <div 
      className={`battle-map-container h-full w-full relative overflow-hidden ${className}`}
      ref={mapContainerRef}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        className={`map-content zoomable relative w-full h-full ${spacePressed ? 'grab' : ''}`}
        ref={mapContentRef}
        style={{ 
          transform: `scale(${zoom}) translate(${mapPosition.x / zoom}px, ${mapPosition.y / zoom}px)`,
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : (spacePressed ? 'grab' : 'default'),
          ...contentStyle
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
        
        {gridVisible && (
          <div className="battle-grid-container absolute inset-0 pointer-events-none">
            <BattleGrid 
              gridSize={gridSize}
              visible={true}
              opacity={gridOpacity}
            />
          </div>
        )}
          
        {fogOfWar && (
          <div className="fog-of-war-container absolute inset-0">
            <FogOfWar
              gridSize={gridSize}
              revealedCells={revealedCells}
              onRevealCell={onRevealCell}
              active={fogOfWar}
              lightSources={updatedLightSources}
              tokenPositions={tokenPositions}
              isDM={isDM}
              isDynamicLighting={isDynamicLighting}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBattleMap;
