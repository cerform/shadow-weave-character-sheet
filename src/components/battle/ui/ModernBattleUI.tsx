// src/components/battle/ui/ModernBattleUI.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Heart,
  Menu,
  ChevronDown,
  X
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
    <TooltipProvider>
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Компактная верхняя панель статуса */}
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
                
                <Separator orientation="vertical" className="h-4" />
                <span className="text-xs text-muted-foreground">{tokens.length} токенов</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Компактная боковая панель с всплывающими меню */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto z-40">
          <Card className="bg-background/95 backdrop-blur border shadow-lg">
            <CardContent className="p-1">
              <div className="flex flex-col gap-1">
                {/* Карта */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                          <Map className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Управление картой</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-56 p-3">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Map className="w-4 h-4" />
                        Карта
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={onUploadMap} variant="outline" size="sm">
                          <Upload className="w-3 h-3 mr-1" />
                          Загрузить
                        </Button>
                        <Button onClick={onClearMap} variant="outline" size="sm">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Очистить
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Туман войны */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Туман войны</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-64 p-3">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Туман войны
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={paintMode === 'reveal' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPaintMode('reveal')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Показать
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Режим показа областей</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={paintMode === 'hide' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPaintMode('hide')}
                            >
                              <EyeOff className="w-3 h-3 mr-1" />
                              Скрыть
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Режим скрытия областей</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Кисть: {brushSize === 0 ? '1 клетка' : `${brushSize * 2 + 1} клеток`}
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handleRevealAll} variant="secondary" size="sm">
                              Открыть всё
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Убрать весь туман с карты</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handleHideAll} variant="secondary" size="sm">
                              Скрыть всё
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Покрыть всю карту туманом</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Токены */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 relative">
                          <Users className="w-4 h-4" />
                          {tokens.length > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs flex items-center justify-center"
                            >
                              {tokens.length}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Токены ({tokens.length})</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-72 p-3">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Токены ({tokens.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {tokens.map((token) => (
                          <div
                            key={token.id}
                            className={`p-2 rounded border ${
                              token.id === activeId ? 'bg-primary/10 border-primary' : 'bg-muted/30'
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
                                <Heart className="w-3 h-3 text-red-500" />
                                {token.hp}/{token.maxHp}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-500" />
                                {token.ac}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Боевые действия */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                          <Sword className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Боевые действия</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-56 p-3">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Бой
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Sword className="w-3 h-3 mr-1" />
                              Атака
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Совершить атаку</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Shield className="w-3 h-3 mr-1" />
                              Защита
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Встать в защитную стойку</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Dice6 className="w-3 h-3 mr-1" />
                              Бросок
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Сделать проверку навыка</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Zap className="w-3 h-3 mr-1" />
                              Магия
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Использовать заклинание</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Separator className="my-1" />

                {/* Настройки */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Настройки</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Скрытая панель горячих клавиш */}
        <div className="absolute bottom-4 right-4 pointer-events-auto z-30">
          <Popover>
            <PopoverTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-background/80 backdrop-blur border">
                    <Menu className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Горячие клавиши</p>
                </TooltipContent>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-64 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Горячие клавиши</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <kbd className="px-1 bg-muted rounded">Ctrl + клик</kbd>
                    <span>Скрыть</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-1 bg-muted rounded">Alt + клик</kbd>
                    <span>Показать</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-1 bg-muted rounded">F</kbd>
                    <span>Переключить</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-1 bg-muted rounded">Перетаскивание</kbd>
                    <span>Рисовать</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
};