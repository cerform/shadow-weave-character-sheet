// Простой UI без сложных Popover'ов
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Upload, 
  RotateCcw, 
  Zap, 
  Settings, 
  Map,
  Users,
  Dice6,
  Sword,
  Shield,
  Heart
} from 'lucide-react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useEnhancedFogStore } from '@/stores/enhancedFogStore';

interface SimpleBattleUIProps {
  paintMode: 'reveal' | 'hide';
  setPaintMode: (mode: 'reveal' | 'hide') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onUploadMap: () => void;
  onClearMap: () => void;
}

export const SimpleBattleUI: React.FC<SimpleBattleUIProps> = ({
  paintMode,
  setPaintMode,
  brushSize,
  setBrushSize,
  onUploadMap,
  onClearMap
}) => {
  const { tokens, activeId, currentRound } = useEnhancedBattleStore();
  const { toast } = useToast();
  
  const activeToken = tokens.find(t => t.id === activeId);

  const handleRevealAll = () => {
    console.log('🔍 Revealing all fog');
    toast({
      title: "Туман убран",
      description: "Весь туман убран с карты",
    });
    const store = useEnhancedFogStore.getState();
    const dimensions = store.dimensions.get('main-map');
    if (dimensions) {
      store.clearMap('main-map');
      store.initializeMap('main-map', dimensions.width, dimensions.height, true);
    } else {
      store.initializeMap('main-map', 24, 16, true);
    }
  };

  const handleHideAll = () => {
    console.log('🌫️ Hiding all with fog');
    toast({
      title: "Туман добавлен",
      description: "Вся карта покрыта туманом",
    });
    const store = useEnhancedFogStore.getState();
    const dimensions = store.dimensions.get('main-map');
    if (dimensions) {
      store.clearMap('main-map');
      store.initializeMap('main-map', dimensions.width, dimensions.height, false);
    } else {
      store.initializeMap('main-map', 24, 16, false);
    }
  };

  const handleUploadClick = () => {
    console.log('📁 Upload button clicked');
    toast({
      title: "Загрузка карты",
      description: "Выберите файл изображения",
    });
    onUploadMap();
  };

  const handleClearClick = () => {
    console.log('🗑️ Clear button clicked');
    toast({
      title: "Карта очищена",
      description: "Карта была очищена",
    });
    onClearMap();
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Верхняя панель статуса */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50">
        <Card className="bg-background/95 backdrop-blur border shadow-lg">
          <CardContent className="p-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Раунд {currentRound}</span>
              </div>
              
              {activeToken && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant="outline" className="text-xs">{activeToken.name}</Badge>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-red-600">
                      <Heart className="w-3 h-3" />
                      {activeToken.hp}/{activeToken.maxHp}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Shield className="w-3 h-3" />
                      {activeToken.ac}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Левая панель с простыми кнопками */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto z-40">
        <Card className="bg-background/95 backdrop-blur border shadow-lg">
          <CardContent className="p-3 space-y-2">
            {/* Секция карты */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Карта</div>
              <div className="flex gap-2">
                <Button onClick={handleUploadClick} variant="outline" size="sm">
                  <Upload className="w-3 h-3 mr-1" />
                  Загрузить
                </Button>
                <Button onClick={handleClearClick} variant="outline" size="sm">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Очистить
                </Button>
              </div>
            </div>

            <Separator />

            {/* Секция тумана */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Туман войны</div>
              <div className="flex gap-2">
                <Button
                  variant={paintMode === 'reveal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    console.log('🔍 Setting paint mode to reveal');
                    toast({
                      title: "Режим изменен",
                      description: "Режим: Показать области",
                    });
                    setPaintMode('reveal');
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Показать
                </Button>
                <Button
                  variant={paintMode === 'hide' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    console.log('🌫️ Setting paint mode to hide');
                    toast({
                      title: "Режим изменен",
                      description: "Режим: Скрыть области",
                    });
                    setPaintMode('hide');
                  }}
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Скрыть
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs">
                  Кисть: {brushSize === 0 ? '1 клетка' : `${brushSize * 2 + 1} клеток`}
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => {
                    console.log('🖌️ Brush size changed to:', value[0]);
                    toast({
                      title: "Кисть изменена",
                      description: `Размер: ${value[0] === 0 ? '1 клетка' : `${value[0] * 2 + 1} клеток`}`,
                    });
                    setBrushSize(value[0]);
                  }}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRevealAll} variant="secondary" size="sm">
                  Открыть всё
                </Button>
                <Button onClick={handleHideAll} variant="secondary" size="sm">
                  Скрыть всё
                </Button>
              </div>
            </div>

            <Separator />

            {/* Информация о токенах */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Токены ({tokens.length})
              </div>
              {activeToken && (
                <div className="text-xs p-2 bg-muted/30 rounded">
                  <div className="font-medium">{activeToken.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-red-500">
                      <Heart className="w-2 h-2" />
                      {activeToken.hp}/{activeToken.maxHp}
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                      <Shield className="w-2 h-2" />
                      {activeToken.ac}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};