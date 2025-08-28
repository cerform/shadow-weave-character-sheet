// Компактный интерфейс для 3D боевой карты
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Brush, 
  Eraser,
  Volume2,
  VolumeX,
  Users,
  Map,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Dice6,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

interface CompactBattleUIProps {
  isDM?: boolean;
  fogEnabled: boolean;
  onFogToggle: () => void;
  fogOpacity: number;
  onFogOpacityChange: (value: number) => void;
  brushSize: number;
  onBrushSizeChange: (value: number) => void;
  paintMode: 'reveal' | 'hide';
  onPaintModeChange: (mode: 'reveal' | 'hide') => void;
  musicEnabled: boolean;
  onMusicToggle: () => void;
  turnIndex: number;
  tokensCount: number;
  onNextTurn: () => void;
  onRollDice: (sides: number) => void;
}

export default function CompactBattleUI({
  isDM = false,
  fogEnabled,
  onFogToggle,
  fogOpacity,
  onFogOpacityChange,
  brushSize,
  onBrushSizeChange,
  paintMode,
  onPaintModeChange,
  musicEnabled,
  onMusicToggle,
  turnIndex,
  tokensCount,
  onNextTurn,
  onRollDice
}: CompactBattleUIProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

  return (
    <>
      {/* Компактная верхняя панель */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Статус хода */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Ход {turnIndex + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tokensCount} токенов
              </Badge>
            </div>

            {/* Быстрые действия */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRollDice(20)}
                className="h-8 w-8 p-0"
                title="Бросок d20"
              >
                <Dice6 className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onNextTurn}
                className="h-8 w-8 p-0"
                title="Следующий ход"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onMusicToggle}
                className="h-8 w-8 p-0"
                title={musicEnabled ? "Выключить музыку" : "Включить музыку"}
              >
                {musicEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>

            {/* Кнопки панелей */}
            <div className="flex items-center gap-1 border-l pl-4">
              <Button
                size="sm"
                variant={leftPanelOpen ? "default" : "ghost"}
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="h-8 w-8 p-0"
                title="Панель управления"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant={rightPanelOpen ? "default" : "ghost"}
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="h-8 w-8 p-0"
                title="Панель токенов"
              >
                <Users className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant={bottomPanelOpen ? "default" : "ghost"}
                onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                className="h-8 w-8 p-0"
                title="Журнал"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Левая выдвижная панель - Туман войны */}
      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-40 transition-transform duration-300 ${
        leftPanelOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border rounded-r-lg shadow-lg min-w-72">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Туман войны</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLeftPanelOpen(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {isDM && (
              <>
                {/* Включение/выключение тумана */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Включен</span>
                  <Button
                    size="sm"
                    variant={fogEnabled ? "default" : "outline"}
                    onClick={onFogToggle}
                    className="h-8 w-16"
                  >
                    {fogEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Режим кисти */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Режим кисти</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={paintMode === 'reveal' ? "default" : "outline"}
                      onClick={() => onPaintModeChange('reveal')}
                      className="flex-1"
                    >
                      <Brush className="h-4 w-4 mr-1" />
                      Открыть
                    </Button>
                    <Button
                      size="sm"
                      variant={paintMode === 'hide' ? "default" : "outline"}
                      onClick={() => onPaintModeChange('hide')}
                      className="flex-1"
                    >
                      <Eraser className="h-4 w-4 mr-1" />
                      Скрыть
                    </Button>
                  </div>
                </div>

                {/* Размер кисти */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Размер кисти</span>
                    <Badge variant="outline" className="text-xs">{brushSize}</Badge>
                  </div>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(value) => onBrushSizeChange(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Прозрачность тумана */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Прозрачность</span>
                    <Badge variant="outline" className="text-xs">{Math.round(fogOpacity * 100)}%</Badge>
                  </div>
                  <Slider
                    value={[fogOpacity]}
                    onValueChange={(value) => onFogOpacityChange(value[0])}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Быстрые действия */}
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-sm font-medium">Быстрые действия</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (window as any).fogControls?.revealAll()}
                      className="flex-1 text-xs"
                    >
                      Открыть всё
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (window as any).fogControls?.hideAll()}
                      className="flex-1 text-xs"
                    >
                      Скрыть всё
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Триггер для левой панели */}
      {!leftPanelOpen && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-30">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setLeftPanelOpen(true)}
            className="h-12 w-6 rounded-l-none rounded-r-lg"
            title="Открыть панель тумана"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Правая выдвижная панель - Токены и бестиарий */}
      <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-40 transition-transform duration-300 ${
        rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border rounded-l-lg shadow-lg min-w-80 max-h-[70vh] overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Токены и существа</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRightPanelOpen(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center text-muted-foreground text-sm">
              Содержимое бестиария...
            </div>
          </div>
        </div>
      </div>

      {/* Триггер для правой панели */}
      {!rightPanelOpen && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-30">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setRightPanelOpen(true)}
            className="h-12 w-6 rounded-r-none rounded-l-lg"
            title="Открыть панель токенов"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Нижняя выдвижная панель - Журнал */}
      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 z-40 transition-transform duration-300 ${
        bottomPanelOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border rounded-t-lg shadow-lg w-96 max-h-60 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Журнал событий</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setBottomPanelOpen(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center text-muted-foreground text-sm">
              Журнал боя...
            </div>
          </div>
        </div>
      </div>

      {/* Триггер для нижней панели */}
      {!bottomPanelOpen && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setBottomPanelOpen(true)}
            className="w-12 h-6 rounded-b-none rounded-t-lg"
            title="Открыть журнал"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}