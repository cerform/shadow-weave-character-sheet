
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  Scale,
  Grid3x3,
  Eye,
  EyeOff,
  PanelLeft,
  Sun,
  Moon,
  Map,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Flame
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface MapControlBoxProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  gridVisible: boolean;
  toggleGrid: () => void;
  fogOfWar: boolean;
  toggleFogOfWar: () => void;
  onMoveMap?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAddLight?: (type: 'torch' | 'lantern' | 'daylight') => void;
  revealRadius?: number;
  setRevealRadius?: (value: number) => void;
  gridOpacity?: number;
  setGridOpacity?: (value: number) => void;
}

const MapControlBox: React.FC<MapControlBoxProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  gridVisible,
  toggleGrid,
  fogOfWar,
  toggleFogOfWar,
  onMoveMap,
  onAddLight,
  revealRadius = 3,
  setRevealRadius,
  gridOpacity = 0.5,
  setGridOpacity
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'light' | 'view'>('view');
  const [isMobile, setIsMobile] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  // Определяем, является ли устройство мобильным
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    // Скрываем подсказку после 5 секунд
    const hintTimer = setTimeout(() => {
      setShowHint(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      clearTimeout(hintTimer);
    };
  }, []);
  
  // Скрываем панель при клике вне её
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const controlBox = document.getElementById('map-control-box');
      
      if (controlBox && !controlBox.contains(target) && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Показываем при наведении
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };
  
  // На мобильных устройствах не скрываем при уходе курсора
  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <div 
      id="map-control-box"
      className={`absolute transition-all duration-300 ease-in-out z-20 ${
        isMobile 
          ? isExpanded 
            ? 'bottom-4 left-1/2 transform -translate-x-1/2' 
            : 'bottom-4 left-1/2 transform -translate-x-1/2'
          : isExpanded 
            ? 'bottom-4 right-4' 
            : 'bottom-4 right-4'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Подсказка для пользователя */}
      {showHint && !isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-background/80 backdrop-blur-sm rounded-md border border-border text-xs text-foreground animate-fade-in">
          Наведите для показа панели управления картой
          <div className="absolute -bottom-1 right-2 w-2 h-2 bg-background/80 rotate-45 border-r border-b border-border"></div>
        </div>
      )}
      
      {/* Компактная версия, видна всегда */}
      {!isExpanded && (
        <div 
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <Map size={24} className="text-primary" />
        </div>
      )}
      
      {/* Расширенная панель управления */}
      {isExpanded && (
        <div className="p-3 rounded-lg bg-background/90 backdrop-blur-sm border border-border shadow-lg max-w-[300px] animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={activeTab === 'view' ? "default" : "outline"} 
                onClick={() => setActiveTab('view')} 
                className="h-8 px-2"
              >
                <Eye size={16} className="mr-1" /> Вид
              </Button>
              <Button 
                size="sm" 
                variant={activeTab === 'map' ? "default" : "outline"} 
                onClick={() => setActiveTab('map')} 
                className="h-8 px-2"
              >
                <Map size={16} className="mr-1" /> Карта
              </Button>
              <Button 
                size="sm" 
                variant={activeTab === 'light' ? "default" : "outline"} 
                onClick={() => setActiveTab('light')}
                className="h-8 px-2"
              >
                <Sun size={16} className="mr-1" /> Свет
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </Button>
          </div>
          
          {activeTab === 'view' && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-sm font-medium">Масштаб</div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={onZoomOut} className="h-8 w-8">
                    <ZoomOut size={16} />
                  </Button>
                  <div className="flex-1 text-center text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button size="icon" variant="outline" onClick={onZoomIn} className="h-8 w-8">
                    <ZoomIn size={16} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={onResetZoom} className="h-8">
                    <Scale size={14} className="mr-1" /> Сброс
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="mb-1 text-sm font-medium">Отображение</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant={gridVisible ? "default" : "outline"}
                    onClick={toggleGrid} 
                    className="h-8"
                  >
                    <Grid3x3 size={16} className="mr-1" />
                    {gridVisible ? "Скрыть сетку" : "Показать сетку"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={fogOfWar ? "default" : "outline"}
                    onClick={toggleFogOfWar}
                    className="h-8"
                  >
                    {fogOfWar ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                    {fogOfWar ? "Выкл. туман" : "Вкл. туман"}
                  </Button>
                </div>
              </div>
              
              {setGridOpacity && (
                <div>
                  <div className="mb-1 text-sm font-medium flex items-center justify-between">
                    <span>Прозрачность сетки</span>
                    <span className="text-xs">{Math.round(gridOpacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[gridOpacity * 100]}
                    min={10}
                    max={100}
                    step={10}
                    onValueChange={(value) => setGridOpacity(value[0] / 100)}
                  />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'map' && (
            <div className="space-y-3">
              {onMoveMap && (
                <div>
                  <div className="mb-1 text-sm font-medium">Перемещение карты</div>
                  <div className="grid grid-cols-3 gap-1 place-items-center">
                    <div></div>
                    <Button size="icon" variant="outline" onClick={() => onMoveMap('up')} className="h-8 w-8">
                      <ChevronUp size={16} />
                    </Button>
                    <div></div>
                    
                    <Button size="icon" variant="outline" onClick={() => onMoveMap('left')} className="h-8 w-8">
                      <ChevronLeft size={16} />
                    </Button>
                    <div className="text-xs text-muted-foreground">Двигать</div>
                    <Button size="icon" variant="outline" onClick={() => onMoveMap('right')} className="h-8 w-8">
                      <ChevronRight size={16} />
                    </Button>
                    
                    <div></div>
                    <Button size="icon" variant="outline" onClick={() => onMoveMap('down')} className="h-8 w-8">
                      <ChevronDown size={16} />
                    </Button>
                    <div></div>
                  </div>
                </div>
              )}
              
              {setRevealRadius && (
                <div>
                  <div className="mb-1 text-sm font-medium flex items-center justify-between">
                    <span>Радиус видимости</span>
                    <span className="text-xs">{revealRadius} клеток</span>
                  </div>
                  <Slider
                    value={[revealRadius]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setRevealRadius(value[0])}
                  />
                </div>
              )}
              
              <div>
                <div className="mb-1 text-sm font-medium">Советы</div>
                <div className="text-xs p-2 bg-muted/30 rounded-md">
                  <p>• Правый клик или пробел + ЛКМ для перемещения карты</p>
                  <p>• Колесо мыши для масштабирования</p>
                  <p>• CTRL + ЛКМ для выделения области на карте</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'light' && onAddLight && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-sm font-medium">Добавить источник света</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddLight('torch')}
                    className="h-auto py-2 flex flex-col items-center"
                    style={{ color: currentTheme.accent }}
                  >
                    <Flame size={16} className="mb-1" style={{ color: '#FF6A00' }} />
                    <span className="text-xs">Факел</span>
                    <span className="text-[10px] text-muted-foreground">радиус 6</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddLight('lantern')}
                    className="h-auto py-2 flex flex-col items-center"
                    style={{ color: currentTheme.accent }}
                  >
                    <Lightbulb size={16} className="mb-1" style={{ color: '#FFD700' }} />
                    <span className="text-xs">Фонарь</span>
                    <span className="text-[10px] text-muted-foreground">радиус 10</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddLight('daylight')}
                    className="h-auto py-2 flex flex-col items-center"
                    style={{ color: currentTheme.accent }}
                  >
                    <Sun size={16} className="mb-1" style={{ color: '#FFFFFF' }} />
                    <span className="text-xs">Дневной</span>
                    <span className="text-[10px] text-muted-foreground">по всей карте</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="mb-1 text-sm font-medium">Окружение</div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 h-auto py-2 flex flex-col items-center"
                    onClick={() => {
                      if (onAddLight) {
                        onAddLight('torch');
                        onAddLight('torch');
                        onAddLight('torch');
                        onAddLight('torch');
                      }
                    }}
                  >
                    <Moon size={16} className="mb-1" />
                    <span className="text-xs">Ночь</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 h-auto py-2 flex flex-col items-center"
                    onClick={() => {
                      if (onAddLight) {
                        onAddLight('daylight');
                      }
                    }}
                  >
                    <Sun size={16} className="mb-1" />
                    <span className="text-xs">День</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-xs p-2 bg-muted/30 rounded-md">
                <p>• Добавьте источники света для создания атмосферы</p>
                <p>• Свет влияет на видимость персонажей в темноте</p>
                <p>• Используйте разные источники света для разных эффектов</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapControlBox;
