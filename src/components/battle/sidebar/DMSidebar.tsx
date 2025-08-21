// Боковая панель для ДМ с расширенным функционалом
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { 
  Users, 
  Eye, 
  Sword, 
  Shield, 
  Crown, 
  Settings, 
  Map, 
  Upload,
  X,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Palette,
  Grid,
  Zap
} from 'lucide-react';

export const DMSidebar: React.FC = () => {
  const {
    tokens,
    characters,
    combatState,
    combatStarted,
    settings,
    updateSettings,
    paintMode,
    setPaintMode,
    brushSize,
    setBrushSize,
    showMovementGrid,
    toggleMovementGrid,
    mapImageUrl,
    setMapImageUrl,
    clearMap,
    startCombat,
    endCombat,
    fogEnabled,
    setFogEnabled
  } = useUnifiedBattleStore();

  const { fogGrid } = useFogOfWarStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Состояния для различных панелей
  const [activePanel, setActivePanel] = useState<'tokens' | 'fog' | 'combat' | 'map' | 'settings'>('tokens');

  // Обработчики файлов
  const handleMapUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setMapImageUrl(url);
    }
  };

  return (
    <div className="w-80 h-full bg-muted/30 border-l border-border flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Панель ДМ</h2>
        </div>
        
        {/* Быстрая статистика */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{tokens.filter(t => !t.isEnemy).length} игроков</span>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            <span>{tokens.filter(t => t.isEnemy).length} врагов</span>
          </div>
        </div>
      </div>

      {/* Навигация по панелям */}
      <div className="p-2 border-b">
        <div className="grid grid-cols-5 gap-1">
          <Button
            variant={activePanel === 'tokens' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('tokens')}
            className="h-8 px-2"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'fog' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('fog')}
            className="h-8 px-2"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'combat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('combat')}
            className="h-8 px-2"
          >
            <Sword className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('map')}
            className="h-8 px-2"
          >
            <Map className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('settings')}
            className="h-8 px-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto">
        {/* Панель управления токенами */}
        {activePanel === 'tokens' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Токены на поле
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tokens.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет активных токенов</p>
                ) : (
                  tokens.map(token => (
                    <div key={token.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-xs font-medium">{token.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {token.hp}/{token.maxHp}
                        </Badge>
                        <Badge variant={token.isEnemy ? 'destructive' : 'default'} className="text-xs">
                          {token.isEnemy ? 'Враг' : 'Игрок'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить игрока
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Crown className="w-4 h-4 mr-2" />
                  Спавн монстра
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Массовое лечение
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Панель тумана войны */}
        {activePanel === 'fog' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Туман войны
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Включить туман</span>
                  <Switch
                    checked={fogEnabled}
                    onCheckedChange={setFogEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm">Размер кисти</span>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([value]) => setBrushSize(value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Размер: {brushSize}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('Очистка тумана')}
                    className="w-full justify-start"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Очистить туман
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('Показать всё')}
                    className="w-full justify-start"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Показать всё
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Панель боевой системы */}
        {activePanel === 'combat' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sword className="w-4 h-4" />
                  Управление боем
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {combatState?.isActive && (
                  <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="text-sm font-medium text-red-600">
                      Бой активен
                    </div>
                    <div className="text-xs text-red-500">
                      Раунд {combatState.round}
                    </div>
                  </div>
                )}

                {!combatStarted ? (
                  <Button 
                    onClick={startCombat}
                    disabled={characters.length === 0}
                    className="w-full"
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Начать бой
                  </Button>
                ) : (
                  <Button 
                    onClick={endCombat}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Закончить бой
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">
                    <Shield className="w-4 h-4 mr-1" />
                    +AC
                  </Button>
                  <Button size="sm" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    Урон
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Панель карты */}
        {activePanel === 'map' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Управление картой
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Сетка движения</span>
                  <Switch
                    checked={showMovementGrid}
                    onCheckedChange={toggleMovementGrid}
                  />
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMapUpload}
                    className="hidden"
                    id="map-upload"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('map-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить карту
                  </Button>
                  
                  {mapImageUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearMap}
                      className="w-full justify-start"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Очистить карту
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-sm">Режим рисования</span>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant={paintMode === 'reveal' ? 'default' : 'outline'}
                      onClick={() => setPaintMode('reveal')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={paintMode === 'hide' ? 'default' : 'outline'}
                      onClick={() => setPaintMode('hide')}
                    >
                      <Palette className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Панель настроек */}
        {activePanel === 'settings' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Номера сетки</span>
                  <Switch
                    checked={settings.showGridNumbers}
                    onCheckedChange={(checked) => updateSettings({ showGridNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Звуковые эффекты</span>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Автосохранение</span>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить сессию
                </Button>

                <Button size="sm" variant="outline" className="w-full justify-start">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Сбросить настройки
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};