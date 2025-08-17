import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Circle, 
  Square, 
  Edit, 
  Palette,
  Zap,
  Globe,
  Settings
} from 'lucide-react';
import { useFogOfWarStore, VisibleArea } from '@/stores/fogOfWarStore';
import { toast } from 'sonner';

export const FogOfWarPanel: React.FC = () => {
  const {
    visibleAreas,
    fogSettings,
    isDrawingMode,
    selectedArea,
    isDM,
    enableFog,
    addVisibleArea,
    removeVisibleArea,
    revealAll,
    hideAll,
    clearAllVisible,
    setFogSettings,
    setDrawingMode,
    selectArea
  } = useFogOfWarStore();

  const [newAreaType, setNewAreaType] = useState<'circle' | 'rectangle'>('circle');
  const [showSettings, setShowSettings] = useState(false);

  const handleAddArea = () => {
    if (!isDM) return;

    const centerX = 600;
    const centerY = 400;

    const newArea: Omit<VisibleArea, 'id'> = {
      x: centerX,
      y: centerY,
      radius: newAreaType === 'circle' ? 100 : 0,
      width: newAreaType === 'rectangle' ? 200 : undefined,
      height: newAreaType === 'rectangle' ? 150 : undefined,
      type: newAreaType
    };

    addVisibleArea(newArea);
    toast.success(`Добавлена область тумана: ${newAreaType === 'circle' ? 'круг' : 'прямоугольник'}`);
  };

  const handleRevealAll = () => {
    revealAll();
    toast.success('Весь туман раскрыт');
  };

  const handleHideAll = () => {
    hideAll();
    toast.success('Весь туман скрыт');
  };

  const handleClearAll = () => {
    clearAllVisible();
    toast.success('Все области тумана удалены');
  };

  if (!isDM) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Туман войны</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Только для ДМ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <EyeOff className="w-5 h-5" />
            Туман войны
          </span>
          <div className="flex items-center gap-2">
            <Switch
              checked={fogSettings.enabled}
              onCheckedChange={enableFog}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleRevealAll}
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={!fogSettings.enabled}
          >
            <Eye className="w-4 h-4 mr-1" />
            Показать всё
          </Button>
          <Button
            onClick={handleHideAll}
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={!fogSettings.enabled}
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Скрыть всё
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
            <div>
              <Label className="text-xs">Цвет тумана</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={fogSettings.fogColor}
                  onChange={(e) => setFogSettings({ fogColor: e.target.value })}
                  className="w-8 h-8 rounded border"
                />
                <Input
                  value={fogSettings.fogColor}
                  onChange={(e) => setFogSettings({ fogColor: e.target.value })}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Непрозрачность: {Math.round(fogSettings.fogOpacity * 100)}%</Label>
              <Slider
                value={[fogSettings.fogOpacity]}
                onValueChange={([value]) => setFogSettings({ fogOpacity: value })}
                min={0}
                max={1}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Размытие: {fogSettings.blurAmount}px</Label>
              <Slider
                value={[fogSettings.blurAmount]}
                onValueChange={([value]) => setFogSettings({ blurAmount: value })}
                min={0}
                max={20}
                step={1}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Add New Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Добавить область</Label>
          <div className="flex gap-2">
            <Select value={newAreaType} onValueChange={(value: 'circle' | 'rectangle') => setNewAreaType(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    Круг
                  </div>
                </SelectItem>
                <SelectItem value="rectangle">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Прямоугольник
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddArea} size="sm" disabled={!fogSettings.enabled}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Drawing Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm">Режим рисования</Label>
          <Switch
            checked={isDrawingMode}
            onCheckedChange={setDrawingMode}
            disabled={!fogSettings.enabled}
          />
        </div>

        {isDrawingMode && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
            💡 Кликните и перетаскивайте области на карте для изменения их размера и положения
          </div>
        )}
      </CardContent>
    </Card>
  );
};