
import React, { useState } from 'react';
import TokensPanel from './TokensPanel';
import InitiativeTracker from './InitiativeTracker';
import DicePanel from '@/components/character-sheet/DicePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Token } from '@/stores/battleStore';
import { LightSource } from '@/types/battle';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { Character } from '@/types/character';

interface RightPanelProps {
  tokens: Token[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  onAddToken: (token: Token) => void;
  onRemoveToken: (id: number) => void;
  onStartBattle: () => void;
  onEndBattle: () => void;
  onRollInitiative: () => void;
  initiative: any[];
  battleActive: boolean;
  fogOfWar: boolean;
  onToggleFogOfWar: () => void;
  onRevealAllFog: () => void;
  onResetFog: () => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  onUpdateGridSettings: (size: any) => void;
  gridSize: { rows: number; cols: number };
  zoom: number;
  onZoomChange: (value: number) => void;
  isDM?: boolean; // Опциональный параметр для режима Мастера
  // Добавляем параметры для работы с освещением
  lightSources?: LightSource[];
  isDynamicLighting?: boolean;
  onToggleDynamicLighting?: () => void;
  onAddLightSource?: (type: 'torch' | 'lantern' | 'daylight' | 'custom', color?: string, intensity?: number) => void;
  onRemoveLightSource?: (id: number) => void;
  onUpdateLightSource?: (id: number, updates: Partial<Omit<LightSource, 'id'>>) => void;
  onAttachLightToToken?: (lightId: number, tokenId: number | undefined) => void;
  onUpdateTokenHP?: (id: number, hp: number) => void;
  onRemoveCondition?: (tokenId: number, conditionIndex: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  tokens,
  selectedTokenId,
  onSelectToken,
  onAddToken,
  onRemoveToken,
  onStartBattle,
  onEndBattle,
  onRollInitiative,
  initiative,
  battleActive,
  fogOfWar,
  onToggleFogOfWar,
  onRevealAllFog,
  onResetFog,
  gridVisible,
  onToggleGrid,
  onUpdateGridSettings,
  gridSize,
  zoom,
  onZoomChange,
  isDM = true, // По умолчанию true
  // Добавляем параметры для работы с освещением
  lightSources = [],
  isDynamicLighting = false,
  onToggleDynamicLighting = () => {},
  onAddLightSource = () => {},
  onRemoveLightSource = () => {},
  onUpdateLightSource = () => {},
  onAttachLightToToken = () => {},
  onUpdateTokenHP = () => {},
  onRemoveCondition = () => {}
}) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenType, setTokenType] = useState<"player" | "monster" | "npc" | "boss">("monster");
  const [gridRowsInput, setGridRowsInput] = useState(gridSize.rows);
  const [gridColsInput, setGridColsInput] = useState(gridSize.cols);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Находим источники света, прикрепленные к выбранному токену
  const attachedLights = lightSources.filter(light => 
    light.attachedToTokenId === selectedTokenId
  );
  
  const handleAddToken = () => {
    if (tokenName) {
      const newToken: Token = {
        id: Date.now(),
        name: tokenName,
        type: tokenType,
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 500),
        img: tokenType === 'player' ? '/assets/tokens/player.png' : '/assets/tokens/monster.png',
        hp: 20,
        maxHp: 20,
        ac: 10,
        initiative: 0,
        conditions: [],
        resources: {},
        visible: true,
        size: 1
      };
      
      onAddToken(newToken);
      setTokenName('');
    }
  };
  
  const handleUpdateGrid = () => {
    onUpdateGridSettings({
      rows: gridRowsInput,
      cols: gridColsInput
    });
  };
  
  const dummyCharacter = createDefaultCharacter();
  
  const handleSelectToken = (id: number) => {
    onSelectToken(id);
  };

  const handleTokenHPChange = (id: number, newHP: number) => {
    onUpdateTokenHP(id, newHP);
  };

  const handleRemoveCondition = (tokenId: number, conditionIndex: number) => {
    onRemoveCondition(tokenId, conditionIndex);
  };
  
  // Фиксируем все числовые преобразования
  const handleOnRemoveLight = (id: string) => {
    onRemoveLightSource(Number(id));
  };
  
  const handleOnAttachLight = (lightId: string, tokenId?: string) => {
    onAttachLightToToken(Number(lightId), tokenId ? Number(tokenId) : undefined);
  };
  
  const handleCharacterUpdate = () => {
    // This is just a dummy function for DicePanel
    console.log('Character update called from RightPanel');
  };

  return (
    <div className="h-full flex flex-col space-y-2 p-2">
      <Tabs defaultValue="tokens" className="flex-1">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="tokens">Токены</TabsTrigger>
          <TabsTrigger value="battle">Бой</TabsTrigger>
          {isDM && <TabsTrigger value="settings">Настройки</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="tokens" className="flex-1 overflow-hidden">
          <TokensPanel
            tokens={tokens}
            selectedTokenId={selectedTokenId}
            onSelectToken={onSelectToken}
            onRemoveToken={onRemoveToken}
          />
          <div className="mt-2 flex space-x-2">
            <Input
              type="text"
              placeholder="Имя токена"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
            <Button onClick={handleAddToken}>Добавить токен</Button>
          </div>
          
          {/* Если выбран токен, показываем прикрепленные источники света */}
          {selectedTokenId && isDM && isDynamicLighting && attachedLights.length > 0 && (
            <div className="mt-4 p-3 border rounded-md">
              <h4 className="font-medium mb-2">Источники света</h4>
              {attachedLights.map(light => (
                <div key={light.id} className="flex justify-between items-center mb-2 p-2 bg-card rounded-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: light.color }}></div>
                    <span className="text-sm">{light.type} (R: {light.radius})</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOnAttachLight(String(light.id), undefined)}
                    >
                      Открепить
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOnRemoveLight(String(light.id))}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Кнопки для добавления источников света к выбранному токену */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddLightSource('torch')}
                >
                  + Факел
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddLightSource('lantern')}
                >
                  + Фонарь
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="battle" className="flex-1 overflow-hidden flex flex-col">
          <InitiativeTracker
            initiative={initiative}
            tokens={tokens}
            battleActive={battleActive}
          />
          <div className="mt-auto flex space-x-2">
            {!battleActive ? (
              <Button onClick={onStartBattle}>Начать бой</Button>
            ) : (
              <Button onClick={onEndBattle}>Завершить бой</Button>
            )}
            <Button variant="outline" onClick={onRollInitiative}>
              Сбросить инициативу
            </Button>
          </div>
        </TabsContent>
        
        {isDM && (
          <TabsContent value="settings" className="flex-1 overflow-auto">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Настройки карты</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={fogOfWar} 
                    onCheckedChange={onToggleFogOfWar}
                    id="fog-toggle" 
                  />
                  <Label htmlFor="fog-toggle">Туман войны</Label>
                </div>
                
                {fogOfWar && (
                  <div className="ml-6 space-y-2">
                    {/* Добавляем переключатель динамического освещения */}
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={isDynamicLighting} 
                        onCheckedChange={onToggleDynamicLighting}
                        id="dynamic-light-toggle" 
                      />
                      <Label htmlFor="dynamic-light-toggle">Динамическое освещение</Label>
                    </div>
                    
                    <Button size="sm" variant="outline" onClick={onRevealAllFog}>
                      Раскрыть весь туман
                    </Button>
                    <Button size="sm" variant="outline" onClick={onResetFog}>
                      Сбросить туман
                    </Button>
                  </div>
                )}
                
                {/* Добавляем список всех источников света на карте */}
                {fogOfWar && isDynamicLighting && lightSources.length > 0 && (
                  <div className="mt-4 p-3 border rounded-md">
                    <h4 className="font-medium mb-2">Все источники света</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {lightSources.map(light => {
                        const attachedToken = tokens.find(t => t.id === light.attachedToTokenId);
                        return (
                          <div key={light.id} className="flex justify-between items-center p-2 bg-card rounded-sm">
                            <div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: light.color }}></div>
                                <span className="text-sm">{light.type} (R: {light.radius})</span>
                              </div>
                              {attachedToken && (
                                <div className="text-xs text-muted-foreground">
                                  Привязан к: {attachedToken.name}
                                </div>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onRemoveLightSource(light.id)}
                            >
                              Удалить
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={gridVisible} 
                    onCheckedChange={onToggleGrid}
                    id="grid-toggle" 
                  />
                  <Label htmlFor="grid-toggle">Показать сетку</Label>
                </div>
                
                {gridVisible && (
                  <div className="ml-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="grid-rows">Строки</Label>
                        <Input 
                          type="number" 
                          id="grid-rows" 
                          value={gridRowsInput} 
                          onChange={e => setGridRowsInput(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grid-cols">Столбцы</Label>
                        <Input 
                          type="number" 
                          id="grid-cols" 
                          value={gridColsInput} 
                          onChange={e => setGridColsInput(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button size="sm" onClick={handleUpdateGrid}>Обновить сетку</Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="zoom-level">Масштаб: {Math.round(zoom * 100)}%</Label>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
                    >
                      -
                    </Button>
                    <input 
                      type="range"
                      id="zoom-level"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => onZoomChange(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      <Card className="p-4">
        <DicePanel 
          character={dummyCharacter} 
          onUpdate={handleCharacterUpdate}
          isDM={isDM} 
          tokens={tokens} 
          selectedTokenId={selectedTokenId || 0}
          onSelectToken={onSelectToken}
        />
      </Card>
    </div>
  );
};

export default RightPanel;
