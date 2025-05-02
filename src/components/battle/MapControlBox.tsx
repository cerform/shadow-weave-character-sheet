
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Scale, Grid3x3, Eye, EyeOff, Settings } from 'lucide-react';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface MapControlBoxProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  gridVisible: boolean;
  toggleGrid: () => void;
  fogOfWar: boolean;
  toggleFogOfWar: () => void;
}

const MapControlBox: React.FC<MapControlBoxProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  gridVisible,
  toggleGrid,
  fogOfWar,
  toggleFogOfWar
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [expanded, setExpanded] = useState(false);
  const [dismissedHint, setDismissedHint] = useState(false);

  // Автоматически скрываем подсказку через 10 секунд
  React.useEffect(() => {
    if (!dismissedHint) {
      const timer = setTimeout(() => {
        setDismissedHint(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [dismissedHint]);

  return (
    <>
      {/* Плавающая панель управления */}
      <div 
        className={`map-control-box fixed top-16 right-4 z-20 transition-all duration-300 ease-in-out ${expanded ? 'opacity-100 translate-x-0' : 'opacity-60 translate-x-2'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded(true)}
      >
        <div className="bg-background/90 backdrop-blur-md p-2 rounded-lg border border-primary/20 shadow-lg">
          {!expanded ? (
            // Компактная версия, когда панель свёрнута
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-10 h-10"
              title="Открыть панель управления картой"
              style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
            >
              <Settings size={18} />
            </Button>
          ) : (
            // Развернутая панель
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 px-2">
                <span>Управление картой</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={onZoomIn} 
                  title="Увеличить"
                  style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={onZoomOut} 
                  title="Уменьшить"
                  style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
                >
                  <ZoomOut size={16} />
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={onResetZoom} 
                  title="Сбросить масштаб"
                  style={{ color: currentTheme.textColor, borderColor: currentTheme.accent }}
                >
                  <Scale size={16} />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={gridVisible ? "default" : "outline"}
                  onClick={toggleGrid}
                  title="Показать/скрыть сетку"
                  className="flex-1"
                >
                  <Grid3x3 size={16} className="mr-1" />
                  Сетка
                </Button>
                
                <Button
                  size="sm"
                  variant={fogOfWar ? "default" : "outline"}
                  onClick={toggleFogOfWar}
                  title="Включить/выключить туман войны"
                  className="flex-1"
                >
                  {fogOfWar ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                  Туман
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Автоматически исчезающая подсказка */}
      {!dismissedHint && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 shadow-md z-50 text-sm animate-fade-in">
          <p className="text-foreground">
            Используйте среднюю кнопку мыши, правую кнопку, пробел+ЛКМ или Ctrl+ЛКМ для перемещения карты
          </p>
          <button 
            className="absolute -top-2 -right-2 bg-muted rounded-full w-5 h-5 flex items-center justify-center hover:bg-muted-foreground/20"
            onClick={() => setDismissedHint(true)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default MapControlBox;
