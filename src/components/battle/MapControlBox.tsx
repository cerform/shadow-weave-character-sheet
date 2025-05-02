
import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Scale, Grid3x3, Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="map-control-box fixed top-16 right-4 z-10 bg-background/90 backdrop-blur-md p-2 rounded-lg border border-primary/20 shadow-md">
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
            {gridVisible ? "Сетка" : "Сетка"}
          </Button>
          
          <Button
            size="sm"
            variant={fogOfWar ? "default" : "outline"}
            onClick={toggleFogOfWar}
            title="Включить/выключить туман войны"
            className="flex-1"
          >
            {fogOfWar ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
            {fogOfWar ? "Туман" : "Туман"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapControlBox;
