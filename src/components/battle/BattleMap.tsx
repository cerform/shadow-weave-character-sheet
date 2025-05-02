
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Grid, ZoomIn, ZoomOut, Eraser, Image, Mouse } from "lucide-react";
import { Token, Initiative } from "@/pages/PlayBattlePage";

interface BattleMapProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  background: string | null;
  setBackground: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  onSelectToken: (id: number | null) => void;
  selectedTokenId: number | null;
  initiative: Initiative[];
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
    // Только средняя кнопка мыши (button: 1) или если выбран инструмент перемещения
    if (e.button === 1 || mapTool === "select") {
      setIsDraggingMap(true);
      setStartDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Перетаскивание карты
  const handleMapDrag = (e: React.MouseEvent) => {
    if (!isDraggingMap) return;

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
        </div>

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
                <Image className="h-4 w-4 mr-1" /> Карта
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
        </div>
      </div>

      {/* Карта */}
      <div
        ref={mapRef}
        className="flex-1 relative overflow-hidden bg-muted"
        onWheel={handleWheel}
        onMouseDown={handleMapDragStart}
        onMouseMove={handleMapDrag}
        style={{ cursor: isDraggingMap ? "grabbing" : mapTool === "select" ? "grab" : "default" }}
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
              <div className="text-gray-500">Загрузите карту сражения</div>
            </div>
          )}

          {/* Сетка */}
          {renderGrid()}

          {/* Токены */}
          {tokens.map((token) => {
            const isActive = initiative.some(
              (init) => init.tokenId === token.id && init.isActive
            );
            
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
                drag={mapTool === "select"}
                dragMomentum={false}
                dragSnapToOrigin={false}
                dragElastic={0.1} // Небольшая эластичность для более плавного перетаскивания
                onDragStart={() => handleDragStart(token.id)}
                onDrag={(e, info) => handleDragUpdate(info, token.id)}
                onDragEnd={(e, info) => handleDragEnd(e, info, token.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectToken(token.id);
                }}
                whileDrag={{ scale: 1.1 * zoom, opacity: 0.8 }} // Слабый эффект при перетаскивании
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
                    className={`w-12 h-12 object-cover rounded-full border-2 token-image-container ${
                      token.type === "boss"
                        ? "token-boss"
                        : token.type === "monster"
                        ? "token-monster"
                        : "token-player"
                    }`}
                  />

                  {/* HP Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
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

                  {/* Имя токена */}
                  <div className="text-center text-xs font-bold mt-1 bg-black/50 text-white rounded px-1 truncate max-w-[90px]">
                    {token.name}
                  </div>
                  
                  {/* Индикаторы состояний */}
                  {token.conditions.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
      </div>
    </div>
  );
};

export default BattleMap;
