
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Scale, Eye, EyeOff, Grid, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface MapToolbarProps {
  // Настройки зума
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  
  // Настройки перемещения карты
  onMoveMap?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  
  // Настройки сетки
  gridVisible?: boolean;
  gridOpacity?: number;
  onToggleGrid?: () => void;
  onSetGridOpacity?: (opacity: number) => void;
  
  // Настройки тумана войны
  fogOfWar?: boolean;
  revealRadius?: number;
  onToggleFog?: () => void;
  onResetFog?: () => void;
  onSetRevealRadius?: (radius: number) => void;
  
  // Режим доступа
  isDM?: boolean;
  onToggleDMMode?: () => void;
  
  // Настройки отображения
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  // Настройки зума
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  
  // Настройки перемещения карты
  onMoveMap,
  
  // Настройки сетки
  gridVisible = true,
  gridOpacity = 0.5,
  onToggleGrid,
  onSetGridOpacity,
  
  // Настройки тумана войны
  fogOfWar = true,
  revealRadius = 3,
  onToggleFog,
  onResetFog,
  onSetRevealRadius,
  
  // Режим доступа
  isDM = true,
  onToggleDMMode,
  
  // Настройки отображения
  variant = 'full',
  className = ''
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Определяем, какие элементы управления показывать в зависимости от варианта отображения
  const showZoom = variant === 'full' || variant === 'compact';
  const showMovement = variant === 'full';
  const showFogControls = variant === 'full' && fogOfWar;
  const showGridControls = variant === 'full' && gridVisible;
  const showDMToggle = variant === 'full' && onToggleDMMode;
  
  return (
    <div className={`map-toolbar space-y-4 ${className}`}>
      {/* Режим DM */}
      {showDMToggle && (
        <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Режим доступа</h3>
            <Button 
              variant={isDM ? "default" : "outline"} 
              size="sm" 
              onClick={onToggleDMMode}
              style={{ background: isDM ? currentTheme.accent : undefined }}
            >
              {isDM ? "DM" : "Игрок"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Управление картой */}
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md">
        <h3 className="font-medium mb-3">Управление картой</h3>
        
        {/* Зум */}
        {showZoom && (
          <div className="space-y-3 mb-4">
            <div>
              <div className="mb-1 text-sm font-medium">Масштаб</div>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={onZoomOut} 
                  className="h-8 w-8" 
                  disabled={!isDM || !onZoomOut}
                >
                  <ZoomOut size={16} />
                </Button>
                <div className="flex-1 text-center text-sm">
                  {Math.round(zoom * 100)}%
                </div>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={onZoomIn} 
                  className="h-8 w-8" 
                  disabled={!isDM || !onZoomIn}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={onResetZoom} 
                  className="h-8" 
                  disabled={!isDM || !onResetZoom}
                >
                  <Scale size={14} className="mr-1" /> Сброс
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Перемещение карты */}
        {showMovement && isDM && onMoveMap && (
          <div className="mb-4">
            <div className="mb-1 text-sm font-medium">Перемещение карты</div>
            <div className="grid grid-cols-3 gap-1 place-items-center">
              <div></div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveMap('up')} 
                className="h-8 w-8"
                disabled={!isDM}
              >
                <ArrowUp size={16} />
              </Button>
              <div></div>
              
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveMap('left')} 
                className="h-8 w-8"
                disabled={!isDM}
              >
                <ArrowLeft size={16} />
              </Button>
              <div className="text-xs text-muted-foreground">Двигать</div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveMap('right')} 
                className="h-8 w-8"
                disabled={!isDM}
              >
                <ArrowRight size={16} />
              </Button>
              
              <div></div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveMap('down')} 
                className="h-8 w-8"
                disabled={!isDM}
              >
                <ArrowDown size={16} />
              </Button>
              <div></div>
            </div>
          </div>
        )}
        
        {/* Туман войны */}
        {(variant !== 'minimal') && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Туман войны</span>
              <Button
                variant={fogOfWar ? "default" : "outline"}
                size="sm"
                onClick={onToggleFog}
                className="gap-1"
                disabled={!isDM || !onToggleFog}
              >
                {fogOfWar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {fogOfWar ? "Активен" : "Выключен"}
              </Button>
            </div>
            
            {showFogControls && onSetRevealRadius && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Радиус открытия</span>
                    <span>{revealRadius} клеток</span>
                  </div>
                  <Slider
                    value={[revealRadius]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(vals) => isDM && onSetRevealRadius(vals[0])}
                    disabled={!isDM}
                  />
                </div>
                
                {onResetFog && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onResetFog}
                    className="w-full mt-1"
                    disabled={!isDM}
                  >
                    Сбросить туман
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Сетка */}
        {(variant !== 'minimal') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Сетка</span>
              <Button
                variant={gridVisible ? "default" : "outline"}
                size="sm"
                onClick={onToggleGrid}
                className="gap-1"
                disabled={!isDM || !onToggleGrid}
              >
                {gridVisible ? <Grid className="h-4 w-4" /> : <Grid className="h-4 w-4 text-muted-foreground" />}
                {gridVisible ? "Видна" : "Скрыта"}
              </Button>
            </div>
            
            {showGridControls && onSetGridOpacity && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Прозрачность сетки</span>
                  <span>{Math.round(gridOpacity * 100)}%</span>
                </div>
                <Slider
                  value={[gridOpacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={(vals) => isDM && onSetGridOpacity(vals[0])}
                  disabled={!isDM}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapToolbar;
