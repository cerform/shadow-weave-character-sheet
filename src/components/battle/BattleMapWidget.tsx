import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Map,
  Grid3X3,
  Cloud,
  Upload,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { VisibleArea } from './FogOfWarLayer';
import MapUploader from './MapUploader';
import TerrainPalette from './TerrainPalette';

interface BattleMapWidgetProps {
  // Fog of War
  showFogOfWar: boolean;
  onToggleFogOfWar: (show: boolean) => void;
  fogVisibleAreas: VisibleArea[];
  onFogAreasChange: (areas: VisibleArea[]) => void;
  windowSize: { width: number; height: number };

  // Grid
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  gridRows: number;
  onGridRowsChange: (rows: number) => void;
  gridCols: number;
  onGridColsChange: (cols: number) => void;
  gridSizes: number[];

  // Tokens
  tokensCount: number;
  onAddToken: () => void;
  onClearTokens: () => void;

  // Map
  mapImage: string | null;
  onMapLoaded: (imageUrl: string, scale?: number) => void;
  onMapRemove: () => void;

  // Terrain
  selectedTerrain: any;
  onTerrainSelect: (terrain: any) => void;
}

const BattleMapWidget: React.FC<BattleMapWidgetProps> = ({
  showFogOfWar,
  onToggleFogOfWar,
  fogVisibleAreas,
  onFogAreasChange,
  windowSize,
  showGrid,
  onToggleGrid,
  gridSize,
  onGridSizeChange,
  gridRows,
  onGridRowsChange,
  gridCols,
  onGridColsChange,
  gridSizes,
  tokensCount,
  onAddToken,
  onClearTokens,
  mapImage,
  onMapLoaded,
  onMapRemove,
  selectedTerrain,
  onTerrainSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');

  const handleClearAllFog = () => {
    onFogAreasChange([]);
  };

  const handleRevealAllFog = () => {
    const fullArea: VisibleArea = {
      id: 'full_reveal',
      x: 0,
      y: 0,
      type: 'rectangle',
      width: windowSize.width,
      height: windowSize.height,
      radius: 0
    };
    onFogAreasChange([fullArea]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Кнопка-триггер */}
      <div className="flex flex-col items-end gap-2">
        {isOpen && (
          <Card className="w-80 max-h-96 overflow-hidden shadow-xl border-2">
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Управление картой</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                  <TabsTrigger value="tokens" className="text-xs">
                    <Settings className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="fog" className="text-xs">
                    <Cloud className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="text-xs">
                    <Grid3X3 className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-xs">
                    <Map className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="terrain" className="text-xs">
                    <Upload className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>

                <div className="max-h-80 overflow-y-auto">
                  <TabsContent value="tokens" className="p-4 space-y-3">
                    <div className="text-sm font-medium">Управление токенами</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={onAddToken} size="sm" className="text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Добавить
                      </Button>
                      
                      <Button 
                        onClick={() => onToggleGrid(!showGrid)}
                        variant={showGrid ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {showGrid ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        Сетка
                      </Button>
                    </div>

                    <Button 
                      onClick={onClearTokens}
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Очистить токены
                    </Button>

                    <div className="text-xs text-muted-foreground">
                      Токенов на карте: {tokensCount}
                    </div>
                  </TabsContent>

                  <TabsContent value="fog" className="p-4 space-y-3">
                    <div className="text-sm font-medium">Туман войны</div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showFogOfWar}
                        onChange={(e) => onToggleFogOfWar(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-xs">Включить туман</label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleClearAllFog}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Скрыть всё
                      </Button>
                      
                      <Button
                        onClick={handleRevealAllFog}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Показать всё
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Видимых областей: {fogVisibleAreas.length}
                    </div>
                  </TabsContent>

                  <TabsContent value="grid" className="p-4 space-y-3">
                    <div className="text-sm font-medium">Настройки сетки</div>
                    
                    <div>
                      <label className="text-xs font-medium mb-1 block">Размер клетки</label>
                      <div className="grid grid-cols-2 gap-1">
                        {gridSizes.map(size => (
                          <Button
                            key={size}
                            variant={gridSize === size ? 'default' : 'outline'}
                            onClick={() => onGridSizeChange(size)}
                            size="sm"
                            className="text-xs"
                          >
                            {size}px
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Строки</label>
                        <input
                          type="number"
                          value={gridRows}
                          onChange={(e) => onGridRowsChange(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1 border border-border rounded bg-background text-xs"
                          min="1"
                          max="50"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium mb-1 block">Столбцы</label>
                        <input
                          type="number"
                          value={gridCols}
                          onChange={(e) => onGridColsChange(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1 border border-border rounded bg-background text-xs"
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Размер карты: {gridCols * gridSize}×{gridRows * gridSize}px
                    </div>
                  </TabsContent>

                  <TabsContent value="map" className="p-4">
                    <MapUploader
                      onMapLoaded={onMapLoaded}
                      currentMapUrl={mapImage}
                      onMapRemove={onMapRemove}
                    />
                  </TabsContent>

                  <TabsContent value="terrain" className="p-4">
                    <TerrainPalette
                      onElementSelect={onTerrainSelect}
                      selectedElement={selectedTerrain}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Основная кнопка */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full shadow-lg"
          size="sm"
        >
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
};

export default BattleMapWidget;