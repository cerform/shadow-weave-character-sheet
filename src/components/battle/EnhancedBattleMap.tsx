
import React, { useState, useRef, useEffect } from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import Token from './Token';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Token as TokenType, Initiative } from '@/stores/battleStore';
import { LightSource } from '@/types/battle';

interface EnhancedBattleMapProps {
  tokens: TokenType[];
  setTokens: React.Dispatch<React.SetStateAction<TokenType[]>> | ((newToken: TokenType) => void);
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Отслеживаем размер контейнера
  useEffect(() => {
    const updateContainerSize = () => {
      if (mapContainerRef.current) {
        setContainerSize({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight
        });
      }
    };
    
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // Начало перемещения карты только если нажата средняя кнопка мыши, правая кнопка мыши,
    // или левая кнопка мыши с зажатой клавишей пробела или Ctrl
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

  // Обработка нажатия клавиш для включения режима перемещения карты
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
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed]);

  // Отключение контекстного меню для карты
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

  // Центрирование карты
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
  
  // Обработчик клика по карте (снятие выделения с токенов)
  const handleMapClick = (e: React.MouseEvent) => {
    // Отменяем снятие выделения если перетаскивали карту
    if (isDragging) return;
    
    // Отменяем снятие выделения если клик был не по основной области карты
    const target = e.target as HTMLElement;
    if (target.closest('.token')) return;
    
    onSelectToken(null);
  };
  
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
        onClick={handleMapClick}
      >
        {/* Фоновая карта */}
        {background && (
          <img 
            src={background}
            alt="Battle map"
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
          />
        )}
        
        {/* Сетка */}
        {gridVisible && (
          <div className="battle-grid-container absolute inset-0 pointer-events-none">
            <BattleGrid 
              gridSize={gridSize}
              visible={true}
              opacity={gridOpacity}
              imageSize={imageSize}
              containerSize={containerSize}
            />
          </div>
        )}
        
        {/* Токены */}
        {tokens.map(token => (
          <Token 
            key={token.id}
            token={token}
            isSelected={selectedTokenId === token.id}
            gridSize={gridSize}
            imageSize={imageSize}
            zoom={zoom}
            onSelect={onSelectToken}
            onUpdatePosition={onUpdateTokenPosition}
            isDM={isDM}
          />
        ))}
          
        {/* Туман войны */}
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
              imageSize={imageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBattleMap;
