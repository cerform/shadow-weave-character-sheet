// src/components/battle/FogControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFogStore } from '@/stores/fogStore';
import { Eye, EyeOff, Sun, Cloud } from 'lucide-react';

export const FogControls: React.FC = () => {
  const { reveal } = useFogStore();

  const handleRevealArea = (x: number, y: number, radius: number) => {
    reveal('main-map', x, y, radius);
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
    <Card className="absolute top-4 right-4 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Туман войны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRevealArea(10, 10, 5)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Север
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRevealArea(20, 10, 5)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Юг
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRevealArea(15, 5, 5)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Запад
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRevealArea(15, 25, 5)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Восток
          </Button>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleClearAllFog}
            className="w-full text-xs"
          >
            <Sun className="w-3 h-3 mr-1" />
            Убрать весь туман
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleResetFog}
            className="w-full text-xs"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Сбросить туман
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};