import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scene } from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useEnhanced3DTokenManager } from '../systems/Enhanced3DTokenManager';
import { useMonstersStore } from '@/stores/monstersStore';
import { BattleEcosystem } from '../shared/BattleEcosystem';
import { MonsterSpawner } from '@/components/dm/MonsterSpawner';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Map, 
  Grid as GridIcon,
  Move, 
  Sword, 
  Sparkles, 
  Package, 
  SkipForward, 
  Dice6,
  Shield,
  Heart,
  Settings,
  Trash,
  Upload,
  Crown,
  Users,
  Clock,
  Target
} from 'lucide-react';

interface TacticalBattleViewProps {
  isDM: boolean;
}

export function TacticalBattleView({ isDM }: TacticalBattleViewProps) {
  const sceneRef = useRef<Scene>();
  const sessionId = 'demo-session';
  
  const {
    tokens,
    characters,
    combatState,
    combatStarted,
    activeId,
    selectedTokenId,
    mapImageUrl,
    fogEnabled,
    showMovementGrid,
    paintMode,
    brushSize,
    settings,
    // Actions
    startCombat,
    endCombat,
    addCombatEvent,
    setFogEnabled,
    toggleMovementGrid,
    setPaintMode,
    setBrushSize,
    setMapImageUrl,
    clearMap,
    selectToken,
    setActiveToken
  } = useUnifiedBattleStore();

  const { getAllMonsters } = useMonstersStore();
  
  // Система управления токенами
  const tokenManager = useEnhanced3DTokenManager({
    onSpawnMonster: (monster, position) => {
      console.log('🐲 Monster spawned:', monster.name, 'at:', position);
      addCombatEvent({
        actor: 'ДМ',
        action: 'Спавн',
        description: `Создан ${monster.name}`,
        playerName: 'Мастер'
      });
    },
    onTokenClick: (tokenId) => {
      selectToken(tokenId);
      console.log('🎯 Token selected:', tokenId);
    }
  });

  // Состояния UI
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'spawner' | 'map' | 'combat'>('spawner');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  // Получаем активный токен
  const activeToken = tokens.find(token => token.id === (activeId || selectedTokenId));
  const playerTokens = tokens.filter(token => !token.isEnemy);
  const enemyTokens = tokens.filter(token => token.isEnemy);

  // Обработчики файлов
  const handleMapUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setMapImageUrl(url);
    }
    if (event.target) event.target.value = '';
  };

  // Обработчики боевой системы
  const handleStartCombat = () => {
    if (tokens.length > 0) {
      startCombat();
      addCombatEvent({
        actor: 'Система',
        action: 'Начало боя',
        description: 'Бой начался! Бросьте инициативу.',
        playerName: 'Система'
      });
    }
  };

  const handleEndCombat = () => {
    endCombat();
    addCombatEvent({
      actor: 'Система',
      action: 'Конец боя',
      description: 'Бой завершен',
      playerName: 'Система'
    });
  };

  // Обработчики действий
  const handleAttack = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: 'Атака',
        description: `${activeToken.name} атакует`,
        playerName: activeToken.name
      });
    }
  };

  const handleMove = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: 'Перемещение',
        description: `${activeToken.name} перемещается`,
        playerName: activeToken.name
      });
    }
  };

  const handleHeal = () => {
    if (activeToken) {
      const healAmount = Math.floor(Math.random() * 10) + 1;
      tokenManager.healToken(activeToken.id, healAmount);
    }
  };

  const handleDiceRoll = (formula: string, reason?: string) => {
    addCombatEvent({
      actor: activeToken?.name || 'ДМ',
      action: 'Бросок кубика',
      description: `Бросок ${formula}: ${reason || 'Проверка'}`,
      playerName: activeToken?.name || 'ДМ'
    });
  };

  return (
    <div className="w-full h-full relative bg-background text-foreground">
      {/* Заголовок с информацией о бое */}
      <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center">
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-semibold">
                  {isDM ? 'Мастер Подземелий' : 'Игрок'}
                </span>
              </div>
              
              {combatStarted && (
                <Badge variant="destructive" className="animate-pulse">
                  Бой • Раунд {combatState?.round || 1}
                </Badge>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{playerTokens.length} игроков</span>
                <Crown className="w-4 h-4" />
                <span>{enemyTokens.length} врагов</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          {!combatStarted ? (
            <Button 
              onClick={handleStartCombat}
              disabled={tokens.length === 0}
              className="flex items-center gap-2"
            >
              <Sword className="w-4 h-4" />
              Начать бой
            </Button>
          ) : (
            <Button 
              onClick={handleEndCombat}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Завершить бой
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setDiceModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Dice6 className="w-4 h-4" />
            Кубики
          </Button>
        </div>
      </div>

      {/* DM Tools Panel - Левая панель */}
      {isDM && (
        <Card className="absolute top-20 left-4 w-80 z-30 bg-background/90 backdrop-blur-sm max-h-[calc(100vh-200px)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              DM Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Переключатель панелей */}
            <div className="flex gap-1 mb-4">
              <Button
                variant={activePanel === 'spawner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePanel('spawner')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Спавнер
              </Button>
              <Button
                variant={activePanel === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePanel('map')}
                className="flex-1"
              >
                <Map className="w-4 h-4 mr-1" />
                Карта
              </Button>
              <Button
                variant={activePanel === 'combat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePanel('combat')}
                className="flex-1"
              >
                <Sword className="w-4 h-4 mr-1" />
                Бой
              </Button>
            </div>

            <ScrollArea className="h-96">
              {/* Панель спавнера монстров */}
              {activePanel === 'spawner' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Спавнер монстров</h4>
                    <MonsterSpawner
                      sessionId={sessionId}
                      scene={sceneRef.current}
                      onMonsterSpawned={(entityId, object3D) => {
                        console.log('Monster spawned:', entityId);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Spawned Entities</h4>
                    <div className="space-y-2">
                      {tokens.map(token => (
                        <div 
                          key={token.id}
                          className={`p-2 rounded border cursor-pointer hover:bg-muted/50 ${
                            selectedTokenId === token.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => selectToken(token.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: token.color }}
                              />
                              <span className="text-sm font-medium">{token.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={token.isEnemy ? 'destructive' : 'default'} className="text-xs">
                                {token.hp}/{token.maxHp}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            AC {token.ac} • {token.class}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Панель карты */}
              {activePanel === 'map' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Туман войны</span>
                    <Switch
                      checked={fogEnabled}
                      onCheckedChange={setFogEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Сетка движения</span>
                    <Switch
                      checked={showMovementGrid}
                      onCheckedChange={toggleMovementGrid}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <input
                      ref={setFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMapUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => fileInputRef?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить карту
                    </Button>
                    
                    {mapImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={clearMap}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Очистить карту
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Панель боя */}
              {activePanel === 'combat' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Initiative Order</h4>
                    <div className="space-y-1">
                      {tokens
                        .sort((a, b) => (b.initiative || 0) - (a.initiative || 0))
                        .map(token => (
                          <div 
                            key={token.id}
                            className={`p-2 rounded text-sm ${
                              activeId === token.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted/50'
                            }`}
                          >
                            <div className="flex justify-between">
                              <span>{token.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {token.initiative || 0}
                              </Badge>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Combat Log Panel - Правая панель */}
      <Card className="absolute top-20 right-4 w-80 z-30 bg-background/90 backdrop-blur-sm max-h-[calc(100vh-200px)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Combat Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Раунд</span>
                <Badge>{combatState?.round || 0}</Badge>
              </div>
              
              {activeToken && (
                <div className="p-2 bg-primary/10 rounded">
                  <div className="text-sm font-medium">{activeToken.name}</div>
                  <div className="text-xs text-muted-foreground">
                    HP: {activeToken.hp}/{activeToken.maxHp} • AC: {activeToken.ac}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Party ({playerTokens.length})</h4>
                <div className="space-y-1">
                  {playerTokens.map(token => (
                    <div key={token.id} className="flex justify-between text-xs p-1">
                      <span>{token.name}</span>
                      <span>{token.hp}/{token.maxHp} HP</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Combat Log</h4>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground p-1">
                    Нет событий для записи
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Bar - Нижняя панель */}
      <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMove}
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              Move
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAttack}
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Sword className="w-4 h-4" />
              Attack
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Spell
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Item
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Defend
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleHeal}
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Heal
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="default"
              size="sm"
              disabled={!activeToken}
              className="flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              End Turn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <BattleEcosystem 
          showFog={fogEnabled}
          showMovement={showMovementGrid}
          enableCameraControls={true}
          sessionId={sessionId}
          onSceneReady={(scene) => {
            sceneRef.current = scene;
          }}
        />
      </div>

      {/* Модальные окна */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName={activeToken?.name || (isDM ? 'ДМ' : 'Игрок')}
      />
    </div>
  );
}