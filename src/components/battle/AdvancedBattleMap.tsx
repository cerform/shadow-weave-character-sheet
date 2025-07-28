import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Image as FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Upload, Eye, EyeOff, Grid, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedBattleMapProps {
  isDM?: boolean;
  mapImageUrl?: string;
  onMapUpload?: (imageUrl: string) => void;
}

interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
}

const AdvancedBattleMap: React.FC<AdvancedBattleMapProps> = ({
  isDM = false,
  mapImageUrl,
  onMapUpload
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  
  // Fog of War настройки
  const [fogOfWar, setFogOfWar] = useState(false);
  const [revealRadius, setRevealRadius] = useState([50]);
  const [fogOpacity, setFogOpacity] = useState([0.8]);
  
  // Grid настройки
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState([30]);
  const [gridOpacity, setGridOpacity] = useState([0.3]);
  
  // Map настройки
  const [zoom, setZoom] = useState(1);
  const [mapBackground, setMapBackground] = useState<FabricImage | null>(null);

  // Инициализация Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#f8f9fa',
      selection: isDM
    });

    canvas.on('selection:created', () => {
      if (!isDM) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });

    setFabricCanvas(canvas);
    toast('Карта боя готова!');

    return () => {
      canvas.dispose();
    };
  }, [isDM]);

  // Загрузка изображения карты
  const handleMapUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      
      FabricImage.fromURL(imgUrl).then((img) => {
        // Удаляем предыдущую карту если есть
        if (mapBackground) {
          fabricCanvas.remove(mapBackground);
        }

        // Масштабируем изображение под размер canvas
        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        const scaleX = canvasWidth / img.width!;
        const scaleY = canvasHeight / img.height!;
        const scale = Math.min(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasWidth - img.width! * scale) / 2,
          top: (canvasHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false
        });

        fabricCanvas.add(img);
        fabricCanvas.sendObjectToBack(img);
        setMapBackground(img);
        fabricCanvas.renderAll();
        
        onMapUpload?.(imgUrl);
        toast('Карта загружена и центрирована!');
      });
    };
    reader.readAsDataURL(file);
  }, [fabricCanvas, mapBackground, onMapUpload]);

  // Отрисовка сетки
  const drawGrid = useCallback(() => {
    if (!fabricCanvas) return;

    // Удаляем старую сетку
    const existingGrid = fabricCanvas.getObjects().filter(obj => (obj as any).data === 'grid');
    existingGrid.forEach(obj => fabricCanvas.remove(obj));

    if (!gridVisible) return;

    const size = gridSize[0];
    const opacity = gridOpacity[0];
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();

    // Вертикальные линии
    for (let x = 0; x <= canvasWidth; x += size) {
      const line = new Rect({
        left: x,
        top: 0,
        width: 1,
        height: canvasHeight,
        fill: `rgba(0, 0, 0, ${opacity})`,
        selectable: false,
        evented: false
      });
      (line as any).data = 'grid';
      fabricCanvas.add(line);
    }

    // Горизонтальные линии
    for (let y = 0; y <= canvasHeight; y += size) {
      const line = new Rect({
        left: 0,
        top: y,
        width: canvasWidth,
        height: 1,
        fill: `rgba(0, 0, 0, ${opacity})`,
        selectable: false,
        evented: false
      });
      (line as any).data = 'grid';
      fabricCanvas.add(line);
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, gridVisible, gridSize, gridOpacity]);

  // Туман войны
  const drawFogOfWar = useCallback(() => {
    if (!fabricCanvas || !fogOfWar) return;

    // Удаляем старый туман
    const existingFog = fabricCanvas.getObjects().filter(obj => (obj as any).data === 'fog');
    existingFog.forEach(obj => fabricCanvas.remove(obj));

    const fog = new Rect({
      left: 0,
      top: 0,
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight(),
      fill: `rgba(0, 0, 0, ${fogOpacity[0]})`,
      selectable: false,
      evented: false
    });
    (fog as any).data = 'fog';

    fabricCanvas.add(fog);
    fabricCanvas.bringObjectToFront(fog);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fogOfWar, fogOpacity]);

  // Управление зумом
  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.1, 3);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.1, 0.1);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleResetZoom = () => {
    if (!fabricCanvas) return;
    setZoom(1);
    fabricCanvas.setZoom(1);
    fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvas.renderAll();
  };

  // Добавление токена
  const addToken = useCallback((x: number, y: number) => {
    if (!fabricCanvas || !isDM) return;

    const tokenId = `token_${Date.now()}`;
    const token = new Circle({
      left: x - 15,
      top: y - 15,
      radius: 15,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2
    });
    (token as any).data = { id: tokenId, type: 'token' };

    fabricCanvas.add(token);
    fabricCanvas.renderAll();
    toast('Токен добавлен');
  }, [fabricCanvas, isDM]);

  // Обработчик клика по canvas
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleCanvasClick = (e: any) => {
      if (!isDM) return;
      
      const pointer = fabricCanvas.getPointer(e.e);
      if (!fabricCanvas.getActiveObject()) {
        addToken(pointer.x, pointer.y);
      }
    };

    fabricCanvas.on('mouse:down', handleCanvasClick);

    return () => {
      fabricCanvas.off('mouse:down', handleCanvasClick);
    };
  }, [fabricCanvas, isDM, addToken]);

  // Обновление эффектов при изменении настроек
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  useEffect(() => {
    drawFogOfWar();
  }, [drawFogOfWar]);

  return (
    <div className="flex gap-4 h-full">
      {/* Основная область карты */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Карта боя</h2>
          <div className="flex gap-2">
            <Button onClick={handleZoomOut} size="sm" variant="outline">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button onClick={handleResetZoom} size="sm" variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={handleZoomIn} size="sm" variant="outline">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-lg">
          <canvas ref={canvasRef} className="block" />
        </div>
      </div>

      {/* Панель управления для ДМ */}
      {isDM && (
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Управление картой
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="map" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="map">Карта</TabsTrigger>
                <TabsTrigger value="fog">Туман</TabsTrigger>
                <TabsTrigger value="grid">Сетка</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-4">
                <div>
                  <Label>Загрузить карту</Label>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Выбрать файл
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMapUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="pt-4">
                  <Label>Зум: {zoom.toFixed(1)}x</Label>
                  <div className="text-xs text-muted-foreground mt-1">
                    Клик по пустому месту - добавить токен
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fog" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Туман войны</Label>
                  <Switch checked={fogOfWar} onCheckedChange={setFogOfWar} />
                </div>
                
                {fogOfWar && (
                  <>
                    <div>
                      <Label>Непрозрачность: {fogOpacity[0]}</Label>
                      <Slider
                        value={fogOpacity}
                        onValueChange={setFogOpacity}
                        max={1}
                        min={0.1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Радиус обзора: {revealRadius[0]}px</Label>
                      <Slider
                        value={revealRadius}
                        onValueChange={setRevealRadius}
                        max={200}
                        min={20}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="grid" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Показать сетку</Label>
                  <Switch checked={gridVisible} onCheckedChange={setGridVisible} />
                </div>
                
                {gridVisible && (
                  <>
                    <div>
                      <Label>Размер ячейки: {gridSize[0]}px</Label>
                      <Slider
                        value={gridSize}
                        onValueChange={setGridSize}
                        max={100}
                        min={10}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Прозрачность: {gridOpacity[0]}</Label>
                      <Slider
                        value={gridOpacity}
                        onValueChange={setGridOpacity}
                        max={1}
                        min={0.1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedBattleMap;