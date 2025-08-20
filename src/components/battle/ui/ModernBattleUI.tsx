// src/components/battle/ui/ModernBattleUI.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
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
import { useFogStore } from '@/stores/fogStore';

interface ModernBattleUIProps {
  paintMode: 'reveal' | 'hide';
  setPaintMode: (mode: 'reveal' | 'hide') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onUploadMap: () => void;
  onClearMap: () => void;
}

export const ModernBattleUI: React.FC<ModernBattleUIProps> = ({
  paintMode,
  setPaintMode,
  brushSize,
  setBrushSize,
  onUploadMap,
  onClearMap
}) => {
  const [activePanel, setActivePanel] = useState<'map' | 'fog' | 'tokens' | 'combat' | null>('map');
  const { tokens, activeId, currentRound } = useEnhancedBattleStore();
  
  const activeToken = tokens.find(t => t.id === activeId);

  const handleRevealAll = () => {
    const { size } = useFogStore.getState();
    const clearMap = new Uint8Array(size.w * size.h);
    clearMap.fill(1); // 1 = открыто
    useFogStore.getState().setMap('main-map', clearMap, size.w, size.h);
  };

  const handleHideAll = () => {
    const { size } = useFogStore.getState();
    const fogMap = new Uint8Array(size.w * size.h);
    fogMap.fill(0); // 0 = туман
    useFogStore.getState().setMap('main-map', fogMap, size.w, size.h);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Верхняя панель */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50">
        <Card className="bg-background border-2 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Раунд {currentRound}</span>
              </div>
              
              {activeToken && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{activeToken.name}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{activeToken.hp}/{activeToken.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>{activeToken.ac}</span>
                    </div>
                  </div>
                </>
              )}
              
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground">
                {tokens.length} токенов
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Левая боковая панель */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto z-40">
        <div className="flex flex-col gap-2">
          {/* Навигационные кнопки */}
          <Card className="bg-background border shadow-lg">
            <CardContent className="p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant={activePanel === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'map' ? null : 'map')}
                  className="w-12 h-12 p-0"
                >
                  <Map className="w-5 h-5" />
                </Button>
                <Button
                  variant={activePanel === 'fog' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'fog' ? null : 'fog')}
                  className="w-12 h-12 p-0"
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  variant={activePanel === 'tokens' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'tokens' ? null : 'tokens')}
                  className="w-12 h-12 p-0"
                >
                  <Users className="w-5 h-5" />
                </Button>
                <Button
                  variant={activePanel === 'combat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'combat' ? null : 'combat')}
                  className="w-12 h-12 p-0"
                >
                  <Sword className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Панели управления */}
          {activePanel && (
            <Card className="bg-background border shadow-lg w-64 max-h-[60vh] overflow-y-auto">
              <CardContent className="p-4">
                {activePanel === 'map' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Управление картой
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={onUploadMap} variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить
                      </Button>
                      <Button onClick={onClearMap} variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Очистить
                      </Button>
                    </div>
                  </div>
                )}

                {activePanel === 'fog' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Туман войны
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={paintMode === 'reveal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaintMode('reveal')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Показать
                        </Button>
                        <Button
                          variant={paintMode === 'hide' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaintMode('hide')}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Скрыть
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Размер кисти: {brushSize === 0 ? '1 клетка' : `${brushSize * 2 + 1} клеток`}
                        </label>
                        <Slider
                          value={[brushSize]}
                          onValueChange={(value) => setBrushSize(value[0])}
                          min={0}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleRevealAll} variant="secondary" size="sm">
                          Открыть всё
                        </Button>
                        <Button onClick={handleHideAll} variant="secondary" size="sm">
                          Скрыть всё
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activePanel === 'tokens' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Токены ({tokens.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tokens.map((token) => (
                        <div
                          key={token.id}
                          className={`p-2 rounded-lg border ${
                            token.id === activeId ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{token.name}</span>
                            <Badge variant={token.isEnemy ? 'destructive' : 'secondary'} className="text-xs">
                              {token.isEnemy ? 'Враг' : 'Союзник'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {token.hp}/{token.maxHp}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {token.ac}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePanel === 'combat' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sword className="w-4 h-4" />
                      Боевые действия
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="destructive" size="sm">
                        <Sword className="w-4 h-4 mr-1" />
                        Атака
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-1" />
                        Защита
                      </Button>
                      <Button variant="outline" size="sm">
                        <Dice6 className="w-4 h-4 mr-1" />
                        Бросок
                      </Button>
                      <Button variant="outline" size="sm">
                        <Zap className="w-4 h-4 mr-1" />
                        Заклинание
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Горячие клавиши (подсказка) */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-30">
        <Card className="bg-background border shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs text-muted-foreground">
              <div><kbd className="px-1 bg-muted rounded text-xs">Ctrl + клик</kbd> Скрыть</div>
              <div><kbd className="px-1 bg-muted rounded text-xs">Alt + клик</kbd> Показать</div>
              <div><kbd className="px-1 bg-muted rounded text-xs">F</kbd> Переключить под курсором</div>
              <div><kbd className="px-1 bg-muted rounded text-xs">Перетаскивание</kbd> Рисовать</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};