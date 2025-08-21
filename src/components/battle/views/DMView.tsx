// Интерфейс для Мастера Подземелий
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { BattleEcosystem } from '../shared/BattleEcosystem';
import { CombatUI } from '@/components/dnd5e/CombatUI';
import { BestiaryPage } from '@/components/bestiary/BestiaryPage';
import { SimpleBattleUI } from '../ui/SimpleBattleUI';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
import { DnD5eCombatSystem } from '@/systems/dnd5e/combat';
import type { CombatState } from '@/types/dnd5e';
import { 
  Map, 
  Swords, 
  Users, 
  Book, 
  Settings, 
  Dice6,
  Crown,
  Eye,
  Upload,
  X
} from 'lucide-react';

export const DMView: React.FC = () => {
  const {
    tokens,
    characters,
    combatState,
    combatStarted,
    activeId,
    mapImageUrl,
    paintMode,
    brushSize,
    setPaintMode,
    setBrushSize,
    setMapImageUrl,
    clearMap,
    setCombatState,
    startCombat,
    endCombat,
    addCombatEvent,
    settings,
    updateSettings,
  } = useUnifiedBattleStore();

  const [activeTab, setActiveTab] = useState<'map' | 'combat' | 'bestiary' | 'settings'>('map');
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [combatSystem] = useState(() => new DnD5eCombatSystem());
  
  // Обработчики файлов для карты
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setMapImageUrl(url);
    }
    if (event.target) event.target.value = '';
  };

  const handleUploadMap = () => {
    fileInputRef?.click();
  };

  const handleClearMap = () => {
    clearMap();
  };

  // Управление боем D&D 5e
  const handleStartCombat = () => {
    if (characters.length > 0) {
      combatSystem.startCombat(characters);
      const newState = combatSystem.getState();
      setCombatState(newState);
      startCombat();
      setActiveTab('combat');
    }
  };

  const handleEndCombat = () => {
    combatSystem.endCombat();
    endCombat();
  };

  const handleCombatStateChange = (newState: CombatState) => {
    setCombatState(newState);
    
    // Логирование событий боя
    if (newState.isActive) {
      addCombatEvent({
        actor: newState.turnOrder[newState.currentTurnIndex]?.characterId || 'unknown',
        action: 'turn',
        description: `Ход ${newState.characters.find(
          c => c.id === newState.turnOrder[newState.currentTurnIndex]?.characterId
        )?.name}`,
      });
    }
  };

  const handleDiceRoll = (formula: string, reason?: string) => {
    console.log('Dice roll:', { formula, reason, playerName: 'ДМ' });
    addCombatEvent({
      actor: 'ДМ',
      action: 'dice',
      description: `ДМ бросил ${formula}: ${reason || 'Проверка'}`,
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Заголовок ДМ */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Мастер Подземелий</h1>
            <p className="text-sm text-muted-foreground">
              Полная боевая экосистема D&D 5e
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {combatState?.isActive && (
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              Бой • Раунд {combatState.round}
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDiceModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Dice6 className="w-4 h-4" />
            Кубики
          </Button>
          
          {!combatStarted ? (
            <Button 
              onClick={handleStartCombat} 
              disabled={characters.length === 0}
              className="flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Начать бой
            </Button>
          ) : (
            <Button 
              onClick={handleEndCombat} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Закончить бой
            </Button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full flex">
          {/* Боковая панель */}
          <div className="w-64 border-r bg-muted/50">
            <TabsList className="w-full h-auto flex-col justify-start p-2 bg-transparent">
              <TabsTrigger value="map" className="w-full justify-start">
                <Map className="w-4 h-4 mr-2" />
                3D Карта
              </TabsTrigger>
              <TabsTrigger value="combat" className="w-full justify-start">
                <Swords className="w-4 h-4 mr-2" />
                Боевая система
              </TabsTrigger>
              <TabsTrigger value="bestiary" className="w-full justify-start">
                <Book className="w-4 h-4 mr-2" />
                Бестиарий
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>
            
            {/* Быстрая статистика */}
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Статистика</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Токенов:</span>
                    <Badge variant="outline">{tokens.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Персонажей:</span>
                    <Badge variant="outline">{characters.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Активный:</span>
                    <Badge variant={activeId ? 'default' : 'secondary'}>
                      {activeId ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Основная область */}
          <div className="flex-1">
            <TabsContent value="map" className="w-full h-full m-0 relative">
              {/* UI карты */}
              <SimpleBattleUI
                paintMode={paintMode}
                setPaintMode={setPaintMode}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                onUploadMap={handleUploadMap}
                onClearMap={handleClearMap}
              />
              
              {/* 3D Экосистема */}
              <div className="absolute inset-0 z-0">
                <BattleEcosystem 
                  showFog={true}
                  showMovement={true}
                  enableCameraControls={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="combat" className="w-full h-full m-0 p-4">
              {characters.length > 0 ? (
                <CombatUI 
                  characters={characters}
                  onStateChange={handleCombatStateChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Swords className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Нет участников боя</h3>
                    <p className="text-muted-foreground">
                      Добавьте токены на карту для начала боя
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bestiary" className="w-full h-full m-0">
              <BestiaryPage isDM={true} />
            </TabsContent>

            <TabsContent value="settings" className="w-full h-full m-0 p-4">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-lg font-semibold">Настройки ДМ</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Интерфейс</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Показывать номера клеток</label>
                      <Button
                        variant={settings.showGridNumbers ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ showGridNumbers: !settings.showGridNumbers })}
                      >
                        {settings.showGridNumbers ? 'Включено' : 'Выключено'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Автосинхронизация</label>
                      <Button
                        variant={settings.autoSync ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ autoSync: !settings.autoSync })}
                      >
                        {settings.autoSync ? 'Включено' : 'Выключено'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Права игроков</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Видят HP персонажей</label>
                      <Button
                        variant={settings.playerCanSeeHP ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ playerCanSeeHP: !settings.playerCanSeeHP })}
                      >
                        {settings.playerCanSeeHP ? 'Разрешено' : 'Запрещено'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Скрытый файловый инпут */}
      <input
        ref={setFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Модальные окна */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName="ДМ"
      />
    </div>
  );
};