import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { Eye, EyeOff, Trash2, Settings2, Brush, Eraser } from 'lucide-react';

export const FogControlPanel: React.FC = () => {
  const {
    visibleAreas,
    fogSettings,
    isDrawingMode,
    selectedArea,
    isDM,
    enableFog,
    revealAll,
    hideAll,
    clearAllVisible,
    setFogSettings,
    setDrawingMode,
    removeVisibleArea,
    selectArea
  } = useFogOfWarStore();

  const [showSettings, setShowSettings] = useState(false);

  const handleRevealAll = () => {
    revealAll();
  };

  const handleHideAll = () => {
    hideAll();
  };

  const handleClearAll = () => {
    clearAllVisible();
  };

  if (!isDM) {
    return (
      <Card className="w-80 opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🌫️ Туман войны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center">
            Только для Мастера подземелий
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🌫️ Туман войны
          <Badge variant={fogSettings.enabled ? "default" : "secondary"}>
            {fogSettings.enabled ? "Вкл" : "Выкл"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Включить туман</span>
          <Switch
            checked={fogSettings.enabled}
            onCheckedChange={enableFog}
          />
        </div>

        <Separator />

        {/* Drawing mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Режим рисования</span>
          <Switch
            checked={isDrawingMode}
            onCheckedChange={setDrawingMode}
            disabled={!fogSettings.enabled}
          />
        </div>

        {/* Brush size */}
        {isDrawingMode && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Размер кисти</span>
              <span>{fogSettings.brushSize}px</span>
            </div>
            <Slider
              value={[fogSettings.brushSize]}
              onValueChange={([value]) => setFogSettings({ brushSize: value })}
              min={20}
              max={150}
              step={10}
              className="w-full"
            />
          </div>
        )}

        <Separator />

        {/* Global controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevealAll}
            disabled={!fogSettings.enabled}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            Показать всё
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleHideAll}
            disabled={!fogSettings.enabled}
            className="flex items-center gap-2"
          >
            <EyeOff size={16} />
            Скрыть всё
          </Button>
        </div>

        {/* Settings toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-2"
        >
          <Settings2 size={16} />
          {showSettings ? 'Скрыть настройки' : 'Показать настройки'}
        </Button>

        {/* Settings panel */}
        {showSettings && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Непрозрачность</span>
                  <span>{Math.round(fogSettings.fogOpacity * 100)}%</span>
                </div>
                <Slider
                  value={[fogSettings.fogOpacity]}
                  onValueChange={([value]) => setFogSettings({ fogOpacity: value })}
                  min={0.3}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Размытие</span>
                  <span>{fogSettings.blurAmount}px</span>
                </div>
                <Slider
                  value={[fogSettings.blurAmount]}
                  onValueChange={([value]) => setFogSettings({ blurAmount: value })}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Visible areas list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Видимые области ({visibleAreas.length})
            </span>
            {visibleAreas.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1">
            {visibleAreas.map((area, index) => (
              <div
                key={area.id}
                className={`flex items-center justify-between p-2 rounded text-xs border ${
                  selectedArea === area.id ? 'border-primary bg-primary/10' : 'border-border'
                }`}
                onClick={() => selectArea(area.id)}
              >
                <span>
                  Область {index + 1} ({area.type === 'circle' ? `⭕ ${area.radius}px` : `⬜ ${area.width}×${area.height}`})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVisibleArea(area.id);
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>

          {visibleAreas.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              {isDrawingMode ? 'Нарисуйте области на карте' : 'Включите режим рисования чтобы добавить области'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};