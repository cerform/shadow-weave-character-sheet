
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Scale, Eye, EyeOff, Grid3x3 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface MapControlBoxProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  fogOfWar: boolean;
  onToggleFogOfWar: () => void;
  gridVisible: boolean;
  onToggleGridVisible: () => void;
  onMoveMap?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const MapControlBox: React.FC<MapControlBoxProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  fogOfWar,
  onToggleFogOfWar,
  gridVisible,
  onToggleGridVisible,
  onMoveMap
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  return (
    <Card className="bg-background/80 backdrop-blur-sm">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm">Управление картой</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="fog-toggle">Туман войны</Label>
          <Switch
            id="fog-toggle"
            checked={fogOfWar}
            onCheckedChange={onToggleFogOfWar}
          />
        </div>

        <div className="flex justify-between items-center">
          <Label htmlFor="grid-toggle">Сетка</Label>
          <Switch
            id="grid-toggle"
            checked={gridVisible}
            onCheckedChange={onToggleGridVisible}
          />
        </div>
        
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
        
        {onMoveMap && (
          <div>
            <div className="mb-1 text-sm font-medium">Перемещение карты</div>
            <div className="grid grid-cols-3 gap-1 place-items-center">
              <div></div>
              <Button size="icon" variant="outline" onClick={() => onMoveMap('up')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </Button>
              <div></div>
              
              <Button size="icon" variant="outline" onClick={() => onMoveMap('left')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Button>
              <div className="text-xs text-muted-foreground">Двигать</div>
              <Button size="icon" variant="outline" onClick={() => onMoveMap('right')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Button>
              
              <div></div>
              <Button size="icon" variant="outline" onClick={() => onMoveMap('down')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </Button>
              <div></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapControlBox;
