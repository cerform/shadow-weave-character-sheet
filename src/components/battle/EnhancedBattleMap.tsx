import React, { useState, useRef, useEffect } from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
// Import types from store instead of page
import { Token, Initiative } from '@/stores/battleStore';

interface EnhancedBattleMapProps {
  tokens: Token[];
  // Fixed: Changed type to accept either token add function or state setter
  setTokens: ((token: Token) => void) | React.Dispatch<React.SetStateAction<Token[]>>;
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
  isDM = true
}) => {
  // We will use the external zoom prop instead of local state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [spacePressed, setSpacePressed] = useState(false);
  
  // Улучшенный функционал перетаскивания карты - теперь работает с правой кнопкой мыши или через зажатие пробела
  const handleMouseDown = (e: React.MouseEvent) => {
    // Средняя кнопка мыши или правая или левая при зажатом пробеле или Ctrl
    if (e.button === 1 || e.button === 2 || (e.button === 0 && (spacePressed || e.ctrlKey))) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      
      // Добавляем класс grabbing для визуального фидбека
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
      
      // Убираем класс grabbing
      if (mapContentRef.current) {
        mapContentRef.current.classList.remove('grabbing');
      }
      document.body.classList.remove('grabbing');
    }
  };

  // Обработчик колесика мыши для зума
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey && isDM) { // Проверяем isDM
      e.preventDefault();
      // Здесь больше не меняем zoom локально, а используем внешнюю функцию
      // Вместо этого мы должны вызвать колбэк для изменения зума, если он предоставлен
      
      // Центрирование зума относительно курсора
      if (mapContainerRef.current && mapContentRef.current) {
        const container = mapContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - container.left;
        const mouseY = e.clientY - container.top;
        
        // Вычисляем новую позицию для центрирования зума по курсору
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

  // Добавляем обработчик клавиши пробел для входа в режим перетаскивания
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
    
    // Добавляем обработчик для колесика мыши для масштабирования
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
  }, [spacePressed, isDM]); // isDM добавлен в зависимости

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
        
        // Делаем карту больше контейнера, чтобы обеспечить скроллинг
        const mapWidth = Math.max(containerWidth * 2, img.width * 1.5);
        const mapHeight = Math.max(containerHeight * 2, img.height * 1.5);
        
        content.style.width = `${mapWidth}px`;
        content.style.height = `${mapHeight}px`;
        
        // Центрируем карту
        setMapPosition({ 
          x: (containerWidth - mapWidth) / 2,
          y: (containerHeight - mapHeight) / 2
        });
      };
      img.src = background;
    }
  }, [background]);
  
  // Добавляем функцию для центрирования карты
  const centerMap = () => {
    const container = mapContainerRef.current;
    const content = mapContentRef.current;
    
    if (container && content) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const contentWidth = content.clientWidth;
      const contentHeight = content.clientHeight;
      
      setMapPosition({
        x: (containerWidth - contentWidth * zoom) / 2,
        y: (containerHeight - contentHeight * zoom) / 2
      });
    }
  };
  
  // Центрируем карту при первом рендере и когда изменяется zoom
  useEffect(() => {
    const timer = setTimeout(() => {
      centerMap();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [zoom]);

  return (
    <div 
      className="battle-map-container h-full relative" 
      ref={mapContainerRef}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        className={`map-content zoomable relative overflow-hidden ${spacePressed ? 'grab' : ''}`}
        ref={mapContentRef}
        style={{ 
          transform: `scale(${zoom}) translate(${mapPosition.x / zoom}px, ${mapPosition.y / zoom}px)`,
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : (spacePressed ? 'grab' : 'default')
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <BattleMap
          tokens={tokens}
          setTokens={setTokens} // We pass the prop as is, no type conversion needed now
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
          <div className="fog-of-war-container absolute inset-0">
            <FogOfWar
              gridSize={gridSize}
              revealedCells={revealedCells}
              onRevealCell={onRevealCell}
              active={fogOfWar}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBattleMap;
