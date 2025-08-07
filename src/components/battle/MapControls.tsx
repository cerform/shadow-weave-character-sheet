
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Layers, Map, Sun, Moon, Grid, MoveHorizontal, MoveVertical, ZoomIn, ZoomOut, Scale } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  isDM?: boolean;
  // Добавляем новые свойства для освещения
  isDynamicLighting?: boolean;
  setDynamicLighting?: (value: boolean) => void;
  onAddLight?: (type: 'torch' | 'lantern' | 'daylight' | 'custom', color?: string, intensity?: number) => void;
  // Добавляем свойства для управления картой
  onMoveMap?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  // Добавляем свойства для управления сеткой
  onMoveGrid?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  gridScale?: number;
  onGridZoomIn?: () => void;
  onGridZoomOut?: () => void;
  onResetGridZoom?: () => void;
  onAlignGridToMap?: () => void;
  // Размер квадрата сетки в футах
  gridSquareSize?: number;
  onGridSquareSizeChange?: (size: number) => void;
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
  onResetFogOfWar,
  isDM = true,
  // Новые свойства для освещения
  isDynamicLighting = false,
  setDynamicLighting = () => {},
  onAddLight = () => {},
  // Свойства для управления картой
  onMoveMap = () => {},
  zoom = 1,
  onZoomIn = () => {},
  onZoomOut = () => {},
  onResetZoom = () => {},
  // Свойства для управления сеткой
  onMoveGrid = () => {},
  gridScale = 1,
  onGridZoomIn = () => {},
  onGridZoomOut = () => {},
  onResetGridZoom = () => {},
  onAlignGridToMap = () => {},
  // Размер квадрата сетки
  gridSquareSize = 5,
  onGridSquareSizeChange = () => {}
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md">
        <Tabs defaultValue="map">
          <TabsList className="grid grid-cols-3 mb-3">
            <TabsTrigger value="map">Карта</TabsTrigger>
            <TabsTrigger value="grid">Сетка</TabsTrigger>
            <TabsTrigger value="fog">Туман</TabsTrigger>
          </TabsList>

          {/* Вкладка управления картой */}
          <TabsContent value="map" className="space-y-4">
            <h3 className="font-medium mb-3">Управление картой</h3>
            
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-sm font-medium">Масштаб</div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={onZoomOut} className="h-8 w-8" disabled={!isDM}>
                    <ZoomOut size={16} />
                  </Button>
                  <div className="flex-1 text-center text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button size="icon" variant="outline" onClick={onZoomIn} className="h-8 w-8" disabled={!isDM}>
                    <ZoomIn size={16} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={onResetZoom} className="h-8" disabled={!isDM}>
                    <Scale size={14} className="mr-1" /> Сброс
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="mb-1 text-sm font-medium">Перемещение карты</div>
                <div className="grid grid-cols-3 gap-1 place-items-center">
                  <div></div>
                  <Button size="icon" variant="outline" onClick={() => onMoveMap('up')} className="h-8 w-8" disabled={!isDM}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </Button>
                  <div></div>
                  
                  <Button size="icon" variant="outline" onClick={() => onMoveMap('left')} className="h-8 w-8" disabled={!isDM}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </Button>
                  <div className="text-xs text-muted-foreground">Карта</div>
                  <Button size="icon" variant="outline" onClick={() => onMoveMap('right')} className="h-8 w-8" disabled={!isDM}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Button>
                  
                  <div></div>
                  <Button size="icon" variant="outline" onClick={() => onMoveMap('down')} className="h-8 w-8" disabled={!isDM}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </Button>
                  <div></div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Вкладка управления сеткой */}
          <TabsContent value="grid" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Сетка</span>
                <Button
                  variant={gridVisible ? "default" : "outline"}
                  size="sm"
                  onClick={() => isDM && setGridVisible(!gridVisible)}
                  className="gap-1"
                  disabled={!isDM} // Disable if not DM
                >
                  {gridVisible ? <Grid className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                  {gridVisible ? "Видна" : "Скрыта"}
                </Button>
              </div>
              
              {gridVisible && (
                <>
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
                      onValueChange={(vals) => isDM && setGridOpacity(vals[0])}
                      disabled={!isDM} // Disable if not DM
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-sm font-medium">Размер квадрата</div>
                    <Select 
                      value={gridSquareSize.toString()} 
                      onValueChange={(value) => isDM && onGridSquareSizeChange(parseInt(value))}
                      disabled={!isDM}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Выберите размер" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 футов</SelectItem>
                        <SelectItem value="10">10 футов</SelectItem>
                        <SelectItem value="15">15 футов</SelectItem>
                        <SelectItem value="20">20 футов</SelectItem>
                        <SelectItem value="25">25 футов</SelectItem>
                        <SelectItem value="30">30 футов</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="mb-1 text-sm font-medium">Масштаб сетки</div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={onGridZoomOut} className="h-8 w-8" disabled={!isDM}>
                        <ZoomOut size={16} />
                      </Button>
                      <div className="flex-1 text-center text-sm">
                        {Math.round(gridScale * 100)}%
                      </div>
                      <Button size="icon" variant="outline" onClick={onGridZoomIn} className="h-8 w-8" disabled={!isDM}>
                        <ZoomIn size={16} />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={onResetGridZoom} className="h-8" disabled={!isDM}>
                        <Scale size={14} className="mr-1" /> Сброс
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-1 text-sm font-medium">Перемещение сетки</div>
                    <div className="grid grid-cols-3 gap-1 place-items-center">
                      <div></div>
                      <Button size="icon" variant="outline" onClick={() => onMoveGrid('up')} className="h-8 w-8" disabled={!isDM}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </Button>
                      <div></div>
                      
                      <Button size="icon" variant="outline" onClick={() => onMoveGrid('left')} className="h-8 w-8" disabled={!isDM}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </Button>
                      <div className="text-xs text-muted-foreground">Сетка</div>
                      <Button size="icon" variant="outline" onClick={() => onMoveGrid('right')} className="h-8 w-8" disabled={!isDM}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </Button>
                      
                      <div></div>
                      <Button size="icon" variant="outline" onClick={() => onMoveGrid('down')} className="h-8 w-8" disabled={!isDM}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </Button>
                      <div></div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onAlignGridToMap}
                    className="w-full mt-1"
                    disabled={!isDM} // Disable if not DM
                  >
                    Выровнять по карте
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* Вкладка управления туманом войны */}
          <TabsContent value="fog" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Туман войны</span>
                <Button
                  variant={fogOfWar ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFogOfWar(!fogOfWar)}
                  className="gap-1"
                  disabled={!isDM} // Disable if not DM
                >
                  {fogOfWar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {fogOfWar ? "Активен" : "Выключен"}
                </Button>
              </div>
              
              {fogOfWar && (
                <>
                  {/* Добавляем опцию динамического освещения */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">Динамическое освещение</span>
                    <Switch
                      checked={isDynamicLighting}
                      onCheckedChange={(checked) => isDM && setDynamicLighting(checked)}
                      disabled={!isDM}
                      aria-label="Динамическое освещение"
                    />
                  </div>
                  
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
                      onValueChange={(vals) => isDM && setRevealRadius(vals[0])}
                      disabled={!isDM} // Disable if not DM
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onResetFogOfWar}
                    className="w-full mt-1"
                    disabled={!isDM} // Disable if not DM
                  >
                    Сбросить туман
                  </Button>
                </>
              )}
            </div>
            
            {/* Добавляем секцию для управления светом */}
            {fogOfWar && isDynamicLighting && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Источники света</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => isDM && onAddLight('torch')}
                      disabled={!isDM}
                      className="w-8 h-8"
                      title="Добавить факел"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2c.46 0 .9.18 1.23.5.32.34.5.78.5 1.24v1.52l4.09 4.1c.34.33.51.77.51 1.21V13c0 1.1-.9 2-2 2h-8.63c-.97 0-1.84-.76-1.97-1.71a2 2 0 0 1 .51-1.98l4.09-4.1V3.74c0-.46.18-.9.5-1.23A1.74 1.74 0 0 1 12 2Z"/>
                        <path d="M8 15v3c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3"/>
                        <path d="M13 22H11"/>
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => isDM && onAddLight('lantern')}
                      disabled={!isDM}
                      className="w-8 h-8"
                      title="Добавить фонарь"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21h6"/>
                        <path d="M12 21v-6"/>
                        <path d="M15 9.25a3 3 0 1 0-6 0v1.5L6 12c0 .94.33 1.85.93 2.57A5.02 5.02 0 0 0 12 17c2.22 0 4.17-1.44 4.83-3.55l-1.83-1.7v-2.5Z"/>
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => isDM && onAddLight('daylight')}
                      disabled={!isDM}
                      className="w-8 h-8"
                      title="Добавить дневной свет"
                    >
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => isDM && onAddLight('custom', '#4287f5', 0.7)}
                      disabled={!isDM}
                      className="w-8 h-8"
                      title="Добавить свой источник света"
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MapControls;
