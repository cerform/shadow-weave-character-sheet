
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Layers, Map } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface MapControlsProps {
  fogOfWar: boolean;
  setFogOfWar: (value: boolean) => void;
  revealRadius: number;
  setRevealRadius: (value: number) => void;
  gridVisible: boolean;
  setGridVisible: (value: boolean) => void;
  gridOpacity: number;
  setGridOpacity: (value: number) => void;
  onResetFogOfWar: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  fogOfWar,
  setFogOfWar,
  revealRadius,
  setRevealRadius,
  gridVisible,
  setGridVisible,
  gridOpacity,
  setGridOpacity,
  onResetFogOfWar
}) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md">
      <h3 className="font-medium mb-3">Управление картой</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Туман войны</span>
            <Button
              variant={fogOfWar ? "default" : "outline"}
              size="sm"
              onClick={() => setFogOfWar(!fogOfWar)}
              className="gap-1"
            >
              {fogOfWar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {fogOfWar ? "Активен" : "Выключен"}
            </Button>
          </div>
          
          {fogOfWar && (
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
                  onValueChange={(vals) => setRevealRadius(vals[0])}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onResetFogOfWar}
                className="w-full mt-1"
              >
                Сбросить туман
              </Button>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Сетка</span>
            <Button
              variant={gridVisible ? "default" : "outline"}
              size="sm"
              onClick={() => setGridVisible(!gridVisible)}
              className="gap-1"
            >
              {gridVisible ? <Map className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              {gridVisible ? "Видна" : "Скрыта"}
            </Button>
          </div>
          
          {gridVisible && (
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
                onValueChange={(vals) => setGridOpacity(vals[0])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapControls;
