// src/components/battle/FogControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFogStore } from '@/stores/fogStore';
import { Eye, EyeOff, Sun, Cloud, Brush, Eraser } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FogControlsProps {
  paintMode: 'reveal' | 'hide';
  setPaintMode: (mode: 'reveal' | 'hide') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
}

export const FogControls: React.FC<FogControlsProps> = ({ 
  paintMode, 
  setPaintMode, 
  brushSize, 
  setBrushSize 
}) => {
  const { reveal } = useFogStore();

  const handleRevealArea = (x: number, y: number, radius: number) => {
    reveal('main-map', x, y, radius);
  };

  const handleHideArea = (x: number, y: number, radius: number) => {
    const { maps, size } = useFogStore.getState();
    const map = maps['main-map'];
    if (!map) return;
    
    const newMap = new Uint8Array(map);
    const width = size.w;
    
    // Скрываем область (устанавливаем в 0 = туман)
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < width && py >= 0 && py < size.h) {
            newMap[py * width + px] = 0; // 0 = туман
          }
        }
      }
    }
    
    useFogStore.getState().setMap('main-map', newMap, size.w, size.h);
  };

  const handleClearAllFog = () => {
    const { maps, size } = useFogStore.getState();
    const map = maps['main-map'];
    if (!map) return;
    
    const clearMap = new Uint8Array(map.length);
    clearMap.fill(1); // 1 = открыто
    useFogStore.getState().setMap('main-map', clearMap, size.w, size.h);
  };

  const handleResetFog = () => {
    const { size } = useFogStore.getState();
    const fogMap = new Uint8Array(size.w * size.h);
    fogMap.fill(0); // 0 = туман
    useFogStore.getState().setMap('main-map', fogMap, size.w, size.h);
    // Открываем стартовую область
    reveal('main-map', 15, 15, 3);
  };

  return (
    <Card className="absolute top-20 right-4 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Туман войны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Инструкция по управлению */}
        <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
          <div className="text-xs font-medium text-muted-foreground">Горячие клавиши:</div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div><kbd className="px-1 bg-background rounded">Ctrl + клик</kbd> = Скрыть область</div>
            <div><kbd className="px-1 bg-background rounded">Alt + клик</kbd> = Показать область</div>
            <div><kbd className="px-1 bg-background rounded">Перетаскивание</kbd> = Рисовать</div>
          </div>
        </div>

        {/* Режим рисования */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Управление видимостью (ДМ)</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={paintMode === 'reveal' ? 'default' : 'outline'}
              onClick={() => setPaintMode('reveal')}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Показать
            </Button>
            <Button
              size="sm"
              variant={paintMode === 'hide' ? 'default' : 'outline'}
              onClick={() => setPaintMode('hide')}
              className="text-xs"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Скрыть
            </Button>
          </div>
        </div>

        {/* Размер кисти */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Размер кисти: {brushSize}
          </div>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </div>

        {/* Быстрые области */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground">Быстрое открытие областей</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Revealing North area: (10, 10, 5)');
                handleRevealArea(10, 10, 5);
              }}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Север
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Revealing South area: (20, 10, 5)');
                handleRevealArea(20, 10, 5);
              }}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Юг
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Revealing West area: (15, 5, 5)');
                handleRevealArea(15, 5, 5);
              }}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Запад
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Revealing East area: (15, 25, 5)');
                handleRevealArea(15, 25, 5);
              }}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Восток
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              console.log('Clearing all fog');
              handleClearAllFog();
            }}
            className="w-full text-xs"
          >
            <Sun className="w-3 h-3 mr-1" />
            Открыть всю карту
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              console.log('Resetting fog');
              handleResetFog();
            }}
            className="w-full text-xs"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Скрыть всю карту
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};