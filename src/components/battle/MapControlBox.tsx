
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Scale, Eye, EyeOff, Grid3x3, Users, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  showPlayerView?: boolean;
  onTogglePlayerView?: () => void;
  // Добавляем свойства для сетки
  gridScale?: number;
  onGridZoomIn?: () => void;
  onGridZoomOut?: () => void;
  onResetGridZoom?: () => void;
  onMoveGrid?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAlignGridToMap?: () => void;
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
  onMoveMap,
  showPlayerView = false,
  onTogglePlayerView = () => {},
  // Свойства для сетки
  gridScale = 1,
  onGridZoomIn = () => {},
  onGridZoomOut = () => {},
  onResetGridZoom = () => {},
  onMoveGrid = () => {},
  onAlignGridToMap = () => {}
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
          <Label htmlFor="player-view-toggle">Вид игрока</Label>
          <Switch
            id="player-view-toggle"
            checked={showPlayerView}
            onCheckedChange={onTogglePlayerView}
          />
        </div>
        
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
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="map"><Monitor size={14} className="mr-1" /> Карта</TabsTrigger>
            <TabsTrigger value="grid"><Grid3x3 size={14} className="mr-1" /> Сетка</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <div>
              <div className="mb-1 text-sm font-medium">Масштаб карты</div>
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
              <div className="mt-3">
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
                  <div className="text-xs text-muted-foreground">Карта</div>
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
          </TabsContent>
          
          <TabsContent value="grid">
            <div>
              <div className="mb-1 text-sm font-medium">Масштаб сетки</div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={onGridZoomOut} className="h-8 w-8">
                  <ZoomOut size={16} />
                </Button>
                <div className="flex-1 text-center text-sm">
                  {Math.round(gridScale * 100)}%
                </div>
                <Button size="icon" variant="outline" onClick={onGridZoomIn} className="h-8 w-8">
                  <ZoomIn size={16} />
                </Button>
                <Button size="sm" variant="secondary" onClick={onResetGridZoom} className="h-8">
                  <Scale size={14} className="mr-1" /> Сброс
                </Button>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="mb-1 text-sm font-medium">Перемещение сетки</div>
              <div className="grid grid-cols-3 gap-1 place-items-center">
                <div></div>
                <Button size="icon" variant="outline" onClick={() => onMoveGrid('up')} className="h-8 w-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </Button>
                <div></div>
                
                <Button size="icon" variant="outline" onClick={() => onMoveGrid('left')} className="h-8 w-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </Button>
                <div className="text-xs text-muted-foreground">Сетка</div>
                <Button size="icon" variant="outline" onClick={() => onMoveGrid('right')} className="h-8 w-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Button>
                
                <div></div>
                <Button size="icon" variant="outline" onClick={() => onMoveGrid('down')} className="h-8 w-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
                <div></div>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onAlignGridToMap} 
              className="w-full mt-2"
            >
              Выровнять по карте
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MapControlBox;
