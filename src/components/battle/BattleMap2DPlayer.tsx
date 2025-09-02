import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Circle, Text } from 'react-konva';
import useImage from 'use-image';
import { useSessionSync } from '@/hooks/useSessionSync';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface BattleMap2DPlayerProps {
  sessionId: string;
  mapImageUrl?: string | null;
  tokens: EnhancedToken[];
}

const BattleMap2DPlayer: React.FC<BattleMap2DPlayerProps> = ({
  sessionId,
  mapImageUrl,
  tokens
}) => {
  const stageRef = useRef<any>(null);
  const [mapImage] = useImage(mapImageUrl || '');
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Обновляем размер stage при изменении размера контейнера
  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container().parentElement;
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Обработчик колеса мыши для зума
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Ограничиваем зум
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  return (
    <div className="w-full h-full relative bg-muted">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onDragEnd={(e) => {
          setPosition({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        <Layer>
          {/* Фоновая карта */}
          {mapImage && (
            <Image
              image={mapImage}
              width={800}
              height={600}
              opacity={0.9}
            />
          )}

          {/* Сетка */}
          {Array.from({ length: 33 }, (_, i) => (
            <React.Fragment key={`grid-${i}`}>
              {/* Вертикальные линии */}
              <Circle
                x={i * 25}
                y={0}
                radius={0.5}
                fill="hsl(var(--muted-foreground))"
                opacity={0.3}
              />
              {/* Горизонтальные линии */}
              <Circle
                x={0}
                y={i * 25}
                radius={0.5}
                fill="hsl(var(--muted-foreground))"
                opacity={0.3}
              />
            </React.Fragment>
          ))}

          {/* Токены */}
          {tokens.map((token) => (
            <React.Fragment key={token.id}>
              {/* Круг токена */}
              <Circle
                x={token.position[0] * 25 + 12.5}
                y={token.position[2] * 25 + 12.5}
                radius={12}
                fill={token.color || (token.isEnemy ? "#ef4444" : "#22c55e")}
                stroke="hsl(var(--border))"
                strokeWidth={2}
                opacity={0.8}
              />
              
              {/* Имя токена */}
              <Text
                x={token.position[0] * 25 + 12.5}
                y={token.position[2] * 25 + 30}
                text={token.name}
                fontSize={10}
                fill="hsl(var(--foreground))"
                width={50}
                align="center"
                offsetX={25}
              />

              {/* HP индикатор */}
              {token.hp !== undefined && token.maxHp !== undefined && (
                <React.Fragment>
                  {/* Фон HP бара */}
                  <Circle
                    x={token.position[0] * 25 + 12.5}
                    y={token.position[2] * 25 - 8}
                    radius={8}
                    fill="hsl(var(--destructive))"
                    opacity={0.3}
                  />
                  
                  {/* HP бар */}
                  <Circle
                    x={token.position[0] * 25 + 12.5}
                    y={token.position[2] * 25 - 8}
                    radius={8 * (token.hp / token.maxHp)}
                    fill="hsl(var(--destructive))"
                    opacity={0.8}
                  />
                  
                  {/* Текст HP */}
                  <Text
                    x={token.position[0] * 25 + 12.5}
                    y={token.position[2] * 25 - 12}
                    text={`${token.hp}/${token.maxHp}`}
                    fontSize={8}
                    fill="hsl(var(--foreground))"
                    width={30}
                    align="center"
                    offsetX={15}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>

      {/* Контролы масштаба - улучшенная видимость */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-2 shadow-lg">
        <button
          className="w-10 h-10 bg-primary text-primary-foreground border border-border rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors text-lg font-bold shadow-sm"
          onClick={() => {
            const newScale = Math.min(3, scale * 1.2);
            setScale(newScale);
          }}
          title="Увеличить масштаб"
        >
          +
        </button>
        <div className="text-sm text-center text-foreground px-1 font-mono bg-background/50 rounded border border-border/50 py-1">
          {Math.round(scale * 100)}%
        </div>
        <button
          className="w-10 h-10 bg-primary text-primary-foreground border border-border rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors text-lg font-bold shadow-sm"
          onClick={() => {
            const newScale = Math.max(0.1, scale / 1.2);
            setScale(newScale);
          }}
          title="Уменьшить масштаб"
        >
          -
        </button>
        <button
          className="w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-md flex items-center justify-center hover:bg-secondary/90 transition-colors text-xs font-semibold shadow-sm"
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          title="Сброс масштаба"
        >
          1:1
        </button>
        <button
          className="w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-md flex items-center justify-center hover:bg-secondary/90 transition-colors text-xs font-semibold shadow-sm"
          onClick={() => {
            setScale(0.5);
            setPosition({ x: 0, y: 0 });
          }}
          title="Подогнать карту"
        >
          Fit
        </button>
      </div>

      {/* Информация */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border border-border rounded p-2">
        <div className="text-sm text-muted-foreground">
          Токенов: {tokens.length}
        </div>
        <div className="text-xs text-muted-foreground">
          Зажмите и перетаскивайте для перемещения
        </div>
        <div className="text-xs text-muted-foreground">
          Колесо мыши для масштабирования
        </div>
      </div>
    </div>
  );
};

export default BattleMap2DPlayer;