// Интерфейс для Мастера Подземелий
import React, { useState } from 'react';
import * as THREE from 'three';
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
import { MonsterSpawner } from '@/components/dm/MonsterSpawner';
import { DMSidebar } from '../sidebar/DMSidebar';
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
  X,
  Grid
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
    showMovementGrid,
    isDM,
    settings,
    updateSettings,
  } = useUnifiedBattleStore();

  const [activeTab, setActiveTab] = useState<'map' | 'combat' | 'bestiary' | 'spawner' | 'settings'>('map');
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [combatSystem] = useState(() => new DnD5eCombatSystem());
  const [showFogBrush, setShowFogBrush] = useState(false);
  const [localShowMovementGrid, setLocalShowMovementGrid] = useState(showMovementGrid);
  const [battleScene, setBattleScene] = useState<THREE.Scene | null>(null);
  
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
          {/* Основная область */}
          <div className="flex-1 relative">
            <TabsContent value="map" className="w-full h-full m-0 relative">
              {/* UI карты */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFogBrush(!showFogBrush)}
                  className={showFogBrush ? 'bg-primary text-primary-foreground' : ''}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Туман войны
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalShowMovementGrid(!localShowMovementGrid)}
                  className={localShowMovementGrid ? 'bg-primary text-primary-foreground' : ''}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Сетка движения
                </Button>
                
                {/* Индикатор режимов управления */}
                <div className="bg-background/90 backdrop-blur-sm border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Режимы (клавиши):</div>
                  <div className="space-y-1">
                    <div className="text-green-400">2 - Токены (активно)</div>
                    <div className="text-muted-foreground">3 - Туман войны</div>
                    <div className="text-muted-foreground">4 - Камера</div>
                  </div>
                </div>
              </div>

              {/* Основная 3D сцена */}
              <div className="w-full h-full bg-background">
                <BattleEcosystem 
                  showFog={isDM}
                  showMovement={localShowMovementGrid}
                  enableCameraControls={true}
                  sessionId="demo-session"
                  onSceneReady={(scene) => setBattleScene(scene)}
                />
              </div>
            </TabsContent>

            <TabsContent value="combat" className="w-full h-full m-0">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Боевая система</h3>
                <SimpleBattleUI 
                  paintMode={paintMode}
                  setPaintMode={setPaintMode}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  onUploadMap={handleUploadMap}
                  onClearMap={handleClearMap}
                />
              </div>
            </TabsContent>

            <TabsContent value="spawner" className="w-full h-full m-0">
              <div className="p-4">
                <MonsterSpawner
                  sessionId="demo-session"
                  scene={battleScene}
                  onMonsterSpawned={(entityId, object3D) => {
                    console.log('Monster spawned:', entityId, object3D);
                    // Можно добавить дополнительную логику
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="bestiary" className="w-full h-full m-0">
              <BestiaryPage isDM={isDM} />
            </TabsContent>

            <TabsContent value="settings" className="w-full h-full m-0">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Настройки карты</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="gridNumbers"
                      checked={settings.showGridNumbers}
                      onChange={(e) => updateSettings({ showGridNumbers: e.target.checked })}
                    />
                    <label htmlFor="gridNumbers">Показывать номера сетки</label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Улучшенная боковая панель */}
          <DMSidebar />
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