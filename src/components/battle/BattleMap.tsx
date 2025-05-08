import React, { useRef, useState, useEffect } from 'react';
import { Token, InitiativeItem } from '@/types/battle'; // Импортируем из types/battle
import TokenComponent from './TokenComponent';
import TokenHealthBar from './TokenHealthBar';
import GridOverlay from './GridOverlay';

interface BattleMapProps {
  tokens: Token[];
  // Обновляем тип, чтобы он поддерживал обе сигнатуры функций
  setTokens: React.Dispatch<React.SetStateAction<Token[]>> | ((newToken: Token) => void);
  background: string | null;
  setBackground: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  onSelectToken: (id: number | null) => void;
  selectedTokenId: number | null;
  initiative: InitiativeItem[];
  battleActive: boolean;
}

const GRID_SIZE = 50; // Размер клетки сетки в пикселях

const BattleMap: React.FC<BattleMapProps> = ({
  tokens,
  setTokens,
  background,
  setBackground,
  onUpdateTokenPosition,
  onSelectToken,
  selectedTokenId,
  initiative,
  battleActive,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [draggingTokenId, setDraggingTokenId] = useState<number | null>(null);
  const [mapTool, setMapTool] = useState<"select" | "measure" | "draw" | "fog">("select");
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [dragPath, setDragPath] = useState<{ x: number, y: number }[]>([]);
  const [dragConstraints, setDragConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [selectedTokenSize, setSelectedTokenSize] = useState(1); // Размер выбранного токена
  
  // Новые состояния для тумана войны
  const [fogOfWar, setFogOfWar] = useState<boolean>(false);
  const [showPlayerView, setShowPlayerView] = useState<boolean>(false);
  const [visibleAreas, setVisibleAreas] = useState<VisibleArea[]>([]);
  const [fogBrushSize, setFogBrushSize] = useState(100);
  const [fogDrawMode, setFogDrawMode] = useState<"reveal" | "hide">("reveal");
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const playerViewRef = useRef<HTMLDivElement>(null);
  
  // Добавляем использование темы
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Обновление размеров поля для ограничения перетаскивания
  useEffect(() => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setDragConstraints({
        top: 0,
        left: 0,
        right: rect.width - 64,   // Учитываем размер токена
        bottom: rect.height - 64  // Учитываем размер токена
      });
    }

    // Обработчик изменения размера окна
    const handleResize = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        setDragConstraints({
          top: 0,
          left: 0,
          right: rect.width - 64,
          bottom: rect.height - 64
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapRef.current]);
  
  // Обновляем размер токена при его выборе
  useEffect(() => {
    if (selectedTokenId) {
      const token = tokens.find(t => t.id === selectedTokenId);
      if (token && token.size) {
        setSelectedTokenSize(token.size);
      } else {
        setSelectedTokenSize(1);
      }
    }
  }, [selectedTokenId, tokens]);
  
  // Функция для изменения размера выбранного токена
  const handleTokenResize = (newSize: number) => {
    if (selectedTokenId) {
      setSelectedTokenSize(newSize);
      
      // Проверяем, какой тип функции у нас в setTokens
      if (typeof setTokens === 'function') {
        // Если это функция обновления состояния (setState)
        if (setTokens.length !== 1) {
          (setTokens as React.Dispatch<React.SetStateAction<Token[]>>)(prev => 
            prev.map(token => 
              token.id === selectedTokenId 
                ? { ...token, size: newSize }
                : token
            )
          );
        } else {
          // Мы не можем использовать этот тип функции для обновления существующего токена
          // Выводим предупреждение в консоль
          console.warn("Cannot update token size: setTokens function only accepts new tokens");
        }
      }
    }
  };

  // Обработчик для drag-n-drop изображений напрямую в карту
  const handleMapDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBackground(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.dataTransfer.getData('text').includes('data:image')) {
      // Поддержка drag-n-drop изображений из других источников
      setBackground(e.dataTransfer.getData('text'));
    }
  };

  // Предотвращаем стандартное поведение для drag-n-drop
  const handleMapDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Обработчик загрузки фона карты
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Начало перетаскивания токена
  const handleDragStart = (id: number) => {
    setDraggingTokenId(id);
    onSelectToken(id);
    setDragPath([]);
  };

  // Обновление пути перетаскивания для визуального отслеживания
  const handleDragUpdate = (info: any, id: number) => {
    if (!mapRef.current || draggingTokenId !== id) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = (info.point.x - rect.left - mapOffset.x) / zoom;
    const y = (info.point.y - rect.top - mapOffset.y) / zoom;
    
    // Добавляем точку к пути только если она значительно отличается от предыдущей
    const lastPoint = dragPath[dragPath.length - 1];
    if (!lastPoint || 
        Math.abs(lastPoint.x - x) > GRID_SIZE/4 || 
        Math.abs(lastPoint.y - y) > GRID_SIZE/4) {
      setDragPath([...dragPath, { x, y }]);
    }
  };

  // Завершение перетаскивания токена с привязкой к сетке
  const handleDragEnd = (
    event: any,
    info: { point: { x: number; y: number } },
    id: number
  ) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    // Вычисляем позицию с учетом зума и смещения карты
    const x = (info.point.x - rect.left - mapOffset.x) / zoom;
    const y = (info.point.y - rect.top - mapOffset.y) / zoom;

    // Если сетка включена, привязываем к ней
    const snappedX = showGrid ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
    const snappedY = showGrid ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;

    // Проверка на границы поля
    const constrainedX = Math.max(0, Math.min(snappedX, dragConstraints.right));
    const constrainedY = Math.max(0, Math.min(snappedY, dragConstraints.bottom));

    onUpdateTokenPosition(id, constrainedX, constrainedY);
    setDraggingTokenId(null);
    setDragPath([]);
    
    // Добавляем видимую область вокруг игровых токенов
    if (fogOfWar && tokens.find(t => t.id === id)?.type === 'player') {
      updateVisibleArea(constrainedX, constrainedY, id);
    }
  };

  // Обработчик клика для тумана войны
  const handleMapClick = (e: React.MouseEvent) => {
    if (mapTool !== "fog" || !mapRef.current || !fogCanvasRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - mapOffset.x) / zoom;
    const y = (e.clientY - rect.top - mapOffset.y) / zoom;
    
    // Создаем видимую область тумана войны
    if (fogDrawMode === "reveal") {
      // Добавляем новую область видимости
      const newArea: VisibleArea = {
        x,
        y,
        radius: fogBrushSize,
        tokenId: -1 // Специальный ID для областей, созданных вручную
      };
      
      setVisibleAreas([...visibleAreas, newArea]);
    } else {
      // Удаляем области, находящиеся рядом с кликом
      const updatedAreas = visibleAreas.filter(area => {
        const dx = area.x - x;
        const dy = area.y - y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        return distance > fogBrushSize / 2; // Удаляем все области в радиусе кисти
      });
      
      setVisibleAreas(updatedAreas);
    }
  };

  // Обновление видимых областей для тумана войны
  const updateVisibleArea = (x: number, y: number, tokenId: number) => {
    // Удаляем старую область для этого токена, если она есть
    const newVisibleAreas = visibleAreas.filter(area => area.tokenId !== tokenId);
    
    // Добавляем новую область видимости
    newVisibleAreas.push({
      x, 
      y, 
      radius: 150, // Радиус видимости, можно настроить
      tokenId
    });
    
    setVisibleAreas(newVisibleAreas);
    redrawFogOfWar();
  };
  
  // Обновление тумана войны при перемещении токенов
  useEffect(() => {
    if (fogOfWar) {
      redrawFogOfWar();
    }
  }, [tokens, fogOfWar, visibleAreas]);
  
  // Отрисовка тумана войны на холсте
  const redrawFogOfWar = () => {
    if (!fogCanvasRef.current || !mapRef.current) return;
    
    const ctx = fogCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const mapRect = mapRef.current.getBoundingClientRect();
    fogCanvasRef.current.width = mapRect.width;
    fogCanvasRef.current.height = mapRect.height;
    
    // Заполняем всю карту туманом
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, mapRect.width, mapRect.height);
    
    // Очищаем области видимости
    ctx.globalCompositeOperation = "destination-out" as GlobalCompositeOperation;
    visibleAreas.forEach(area => {
      const scaledX = area.x * zoom + mapOffset.x;
      const scaledY = area.y * zoom + mapOffset.y;
      const scaledRadius = area.radius * zoom;
      
      // Создаем градиентную видимую область
      const gradient = ctx.createRadialGradient(
        scaledX, scaledY, 0,
        scaledX, scaledY, scaledRadius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Возвращаем обратн�� режим отрисовки
    ctx.globalCompositeOperation = "source-over" as GlobalCompositeOperation;
  };

  // Изменение зума колесом мыши
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Предотвращаем прокрутку страницы
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.1, 2));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  // Начало перетаскивания карты средней кнопкой мыши или с инструментом перемещения
  const handleMapDragStart = (e: React.MouseEvent) => {
    // Только если карта не заблокирована
    if (isMapLocked) return;
    
    // Только средняя кнопка мыши (button: 1) или если выбран инструмент перемещения
    if (e.button === 1 || mapTool === "select") {
      setIsDraggingMap(true);
      setStartDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Перетаскивание карты
  const handleMapDrag = (e: React.MouseEvent) => {
    if (!isDraggingMap || isMapLocked) return;

    const dx = e.clientX - startDragPos.x;
    const dy = e.clientY - startDragPos.y;

    setMapOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setStartDragPos({ x: e.clientX, y: e.clientY });
  };

  // Завершение перетаскивания карты
  const handleMapDragEnd = () => {
    setIsDraggingMap(false);
  };

  // Добавляем эффект для слежения за окончанием перетаскивания карты
  useEffect(() => {
    window.addEventListener("mouseup", handleMapDragEnd);
    return () => {
      window.removeEventListener("mouseup", handleMapDragEnd);
    };
  }, []);

  // Вставка изображения из буфера обмена
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setBackground(reader.result as string);
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Отрисовка пути перетаскивания токена
  const renderDragPath = () => {
    if (dragPath.length < 2) return null;

    let pathData = `M ${dragPath[0].x} ${dragPath[0].y}`;
    dragPath.slice(1).forEach(point => {
      pathData += ` L ${point.x} ${point.y}`;
    });

    return (
      <svg className="absolute inset-0 pointer-events-none z-10">
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
          strokeDasharray="5,5"
          style={{ transform: `scale(${zoom})` }}
        />
      </svg>
    );
  };

  // Функция для отрисовки сетки
  const renderGrid = () => {
    if (!showGrid || !mapRef.current) return null;

    const { width, height } = mapRef.current.getBoundingClientRect();
    const horizontalLines = [];
    const verticalLines = [];

    // Рисуем больше линий, учитывая смещение и масштаб
    const extraSize = 1000; // Добавляем дополнительное пространство

    // Горизонтальные линии
    for (let y = -extraSize; y < (height / zoom) + extraSize; y += GRID_SIZE) {
      horizontalLines.push(
        <line
          key={`h-${y}`}
          x1={-extraSize}
          y1={y}
          x2={(width / zoom) + extraSize}
          y2={y}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      );
    }

    // Вертикальные линии
    for (let x = -extraSize; x < (width / zoom) + extraSize; x += GRID_SIZE) {
      verticalLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={-extraSize}
          x2={x}
          y2={(height / zoom) + extraSize}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      );
    }

    // Координатные числа по краям
    const coordinateLabels = [];
    for (let x = 0; x < width / zoom; x += GRID_SIZE) {
      coordinateLabels.push(
        <text
          key={`label-x-${x}`}
          x={x + 5}
          y={20}
          fill="rgba(255,255,255,0.5)"
          fontSize="10"
          style={{ transformOrigin: 'top left' }}
        >
          {Math.floor(x / GRID_SIZE)}
        </text>
      );
    }

    for (let y = 0; y < height / zoom; y += GRID_SIZE) {
      coordinateLabels.push(
        <text
          key={`label-y-${y}`}
          x={5}
          y={y + 15}
          fill="rgba(255,255,255,0.5)"
          fontSize="10"
          style={{ transformOrigin: 'top left' }}
        >
          {Math.floor(y / GRID_SIZE)}
        </text>
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `scale(${zoom})` }}
      >
        {horizontalLines}
        {verticalLines}
        {coordinateLabels}
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Панель инструментов */}
      <div className="bg-muted/10 border-b border-border p-1 flex justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={mapTool === "select" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMapTool("select")}
          >
            <Mouse className="h-4 w-4" />
          </Button>
          <Button
            variant={mapTool === "measure" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMapTool("measure")}
          >
            <div className="text-xs">📏</div>
          </Button>
          <Button
            variant={mapTool === "draw" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMapTool("draw")}
          >
            <div className="text-xs">✏️</div>
          </Button>
          <Button
            variant={mapTool === "fog" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMapTool("fog")}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-6 border-l border-border"></div>
          <Button
            variant={showGrid ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={fogOfWar ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setFogOfWar(!fogOfWar)}
            title="Туман войны"
          >
            {fogOfWar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant={isMapLocked ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMapLocked(!isMapLocked)}
            title={isMapLocked ? "Разблокировать карту" : "Заблокировать карту"}
          >
            {isMapLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>

        {/* Центральные элементы управления для тумана войны */}
        {mapTool === "fog" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Режим:</span>
            <Button
              variant={fogDrawMode === "reveal" ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setFogDrawMode("reveal")}
            >
              Раскрыть
            </Button>
            <Button
              variant={fogDrawMode === "hide" ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setFogDrawMode("hide")}
            >
              Скрыть
            </Button>
            <span className="text-sm text-foreground ml-2">Размер:</span>
            <div className="w-32">
              <Slider
                value={[fogBrushSize]}
                min={20}
                max={300}
                step={10}
                onValueChange={(values) => setFogBrushSize(values[0])}
              />
            </div>
            <span className="text-sm text-foreground">{fogBrushSize}px</span>
          </div>
        )}

        {/* Контролы для размера токена */}
        {selectedTokenId !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Размер токена:</span>
            <div className="w-32">
              <Slider
                value={[selectedTokenSize]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(values) => handleTokenResize(values[0])}
              />
            </div>
            <span className="text-sm text-foreground">{selectedTokenSize.toFixed(1)}x</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="bg-muted/20 px-2 rounded text-sm min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-6 border-l border-border"></div>
          <label htmlFor="upload-bg" className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              asChild
            >
              <span>
                <ImageIcon className="h-4 w-4 mr-1" /> Карта
              </span>
            </Button>
            <input
              id="upload-bg"
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
          </label>
          
          <Button
            variant={showPlayerView ? "default" : "outline"}
            size="sm"
            className="h-8 ml-1"
            onClick={() => setShowPlayerView(!showPlayerView)}
            title="Показать вид игрока"
          >
            <Eye className="h-4 w-4 mr-1" /> Вид игрока
          </Button>
        </div>
      </div>

      {/* Основная карта */}
      <div className="flex-1 flex">
        {/* Главная карта */}
        <div className={`${showPlayerView ? "w-3/4" : "w-full"} relative`}>
          <div
            ref={mapRef}
            className="w-full h-full relative overflow-hidden bg-muted"
            onWheel={handleWheel}
            onMouseDown={handleMapDragStart}
            onMouseMove={handleMapDrag}
            onClick={handleMapClick}
            onDrop={handleMapDrop}
            onDragOver={handleMapDragOver}
            style={{ cursor: isDraggingMap ? "grabbing" : isMapLocked ? "not-allowed" : mapTool === "select" ? "grab" : mapTool === "fog" ? "crosshair" : "default" }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
              }}
            >
              {background ? (
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${background})`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-black flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div className="text-gray-500">
                    Загрузите карту сражения (перетащите изображение или нажмите "Карта")
                  </div>
                </div>
              )}

              {/* Сетка */}
              {renderGrid()}

              {/* Токены */}
              {tokens.map((token) => {
                const isActive = initiative.some(
                  (init) => init.tokenId === token.id && init.isActive
                );
                
                // Получаем размер токена или используем значение по умолчанию
                const tokenSize = token.size || 1;
                const sizeInPixels = 12 * tokenSize;
                
                return (
                  <motion.div
                    key={token.id}
                    className={`absolute cursor-pointer select-none ${
                      selectedTokenId === token.id ? "z-10" : "z-0"
                    }`}
                    style={{
                      left: token.x,
                      top: token.y,
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                    drag={mapTool === "select" && !isMapLocked}
                    dragMomentum={false}
                    dragSnapToOrigin={false}
                    dragElastic={0.1}
                    onDragStart={() => handleDragStart(Number(token.id))}
                    onDrag={(e, info) => handleDragUpdate(info, Number(token.id))}
                    onDragEnd={(e, info) => handleDragEnd(e, info, Number(token.id))}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectToken(Number(token.id));
                    }}
                    whileDrag={{ scale: 1.1 * zoom, opacity: 0.8 }}
                  >
                    <div
                      className={`relative ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-black/50"
                          : ""
                      } ${
                        selectedTokenId === token.id
                          ? "outline outline-2 outline-white/60"
                          : ""
                      }`}
                    >
                      {/* Изображение токена */}
                      <img
                        src={token.img}
                        alt={token.name}
                        className={`object-cover rounded-full border-2 token-image-container ${
                          token.type === "boss"
                            ? "token-boss"
                            : token.type === "monster"
                            ? "token-monster"
                            : "token-player"
                        }`}
                        style={{
                          width: `${sizeInPixels}px`,
                          height: `${sizeInPixels}px`,
                          borderColor: token.type === "boss"
                            ? "#ff5555"
                            : token.type === "monster"
                            ? "#ff9955"
                            : "#55ff55",
                        }}
                      />

                      {/* HP Bar */}
                      {token.hp !== undefined && token.maxHp !== undefined && (
                        <div 
                          className="bg-gray-700 rounded-full h-1 mt-1"
                          style={{width: `${sizeInPixels}px`}}
                        >
                          <div
                            className={`h-1 rounded-full ${
                              token.hp > token.maxHp * 0.6
                                ? "bg-green-500"
                                : token.hp > token.maxHp * 0.3
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Имя токена */}
                      <div 
                        className="text-center text-xs font-bold mt-1 bg-black/50 text-white rounded px-1 truncate"
                        style={{
                          maxWidth: `${sizeInPixels * 2}px`,
                          fontSize: `${8 * Math.min(1, tokenSize)}px`
                        }}
                      >
                        {token.name}
                      </div>
                      
                      {/* Индикаторы состояний */}
                      {token.conditions && token.conditions.length > 0 && (
                        <div 
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                          style={{
                            width: `${Math.max(4, 4 * tokenSize)}px`,
                            height: `${Math.max(4, 4 * tokenSize)}px`,
                            fontSize: `${7 * Math.min(1, tokenSize)}px`
                          }}
                        >
                          {token.conditions.length}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Путь перетаскивания */}
              {renderDragPath()}
            </div>

            {/* Если карта не загружена, показываем подсказку */}
            {!background && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/30 p-4 rounded-md">
                  <label
                    htmlFor="upload-bg-center"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 mb-2 text-gray-300" />
                    <span className="text-gray-300">Загрузить карту</span>
                    <input
                      id="upload-bg-center"
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Вывод информации о текущем ходе */}
            {battleActive && initiative.length > 0 && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-sm font-medium">
                {initiative.find(i => i.isActive)?.name || "Ход не начат"}
              </div>
            )}
            
            {/* Туман войны */}
            {fogOfWar && (
              <canvas 
                ref={fogCanvasRef} 
                className="absolute inset-0 pointer-events-none z-20"
              />
            )}
            
            {/* Индикатор блокировки карты */}
            {isMapLocked && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1 text-sm">
                <Lock className="h-3 w-3" />
                Карта заблокирована
              </div>
            )}
          </div>
        </div>
        
        {/* Вид игрока (превью) */}
        {showPlayerView && (
          <div className="w-1/4 border-l border-border bg-background/50 p-2">
            <h3 className="text-sm font-medium mb-2 text-foreground">Вид игроков</h3>
            <div 
              ref={playerViewRef}
              className="relative w-full h-[calc(100%-30px)] rounded overflow-hidden bg-black/50"
            >
              <div 
                className="absolute inset-0 bg-center bg-cover"
                style={{
                  backgroundImage: background ? `url(${background})` : 'none',
                  transform: 'scale(1)',
                }}
              />
              
              {/* Т��кены в р��жиме игрока */}
              <div className="absolute inset-0 overflow-hidden">
                {tokens
                  // Фильтруем только токены, которые должны быть видны игрокам
                  .filter(token => token.type === 'player' || visibleAreas.some(area => {
                    // Проверяем, находится ли токен в зоне видимости игрока
                    const dx = token.x - area.x;
                    const dy = token.y - area.y;
                    return Math.sqrt(dx*dx + dy*dy) <= area.radius;
                  }))
                  .map(token => {
                    const tokenSize = token.size || 1;
                    return (
                      <div 
                        key={`player-view-${token.id}`}
                        className="absolute"
                        style={{
                          left: `${Number(token.x) / 5}px`,
                          top: `${Number(token.y) / 5}px`,
                          width: `${2 + 8 * tokenSize}px`,
                          height: `${2 + 8 * tokenSize}px`,
                        }}
                      >
                        <div className={`
                          w-full h-full rounded-full border 
                          ${token.type === 'player' ? 'bg-green-500 border-green-300' : 
                            token.type === 'boss' ? 'bg-red-500 border-red-300' : 
                            'bg-yellow-500 border-yellow-300'}
                        `}></div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Туман войны для режима игрока */}
              <div className="absolute inset-0 bg-black/70">
                {visibleAreas.map((area, index) => (
                  <div 
                    key={`visible-area-${index}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${area.x / 5 - area.radius / 5}px`,
                      top: `${area.y / 5 - area.radius / 5}px`,
                      width: `${area.radius / 2.5}px`,
                      height: `${area.radius / 2.5}px`,
                      background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.7) 100%)',
                      mixBlendMode: "overlay" as React.CSSProperties["mixBlendMode"],
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="absolute bottom-2 left-2 text-xs text-white/70">
                Масштаб: 1:5
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMap;
