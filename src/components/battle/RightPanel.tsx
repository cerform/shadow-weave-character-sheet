import React, { useState } from 'react';
import TokensPanel from './TokensPanel';
import InitiativeTracker from './InitiativeTracker';
import { DicePanel } from '@/components/character-sheet/DicePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Token } from '@/stores/battleStore';

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
  isDM = true // По умолчанию true
}) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenType, setTokenType] = useState('monster');
  const [gridRowsInput, setGridRowsInput] = useState(gridSize.rows);
  const [gridColsInput, setGridColsInput] = useState(gridSize.cols);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const handleAddToken = () => {
    if (tokenName) {
      const newToken: Token = {
        id: Date.now(),
        name: tokenName,
        type: tokenType,
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 500),
        img: tokenType === 'player' ? '/assets/tokens/player.png' : '/assets/tokens/monster.png',
        width: 50,
        height: 50,
        initiative: 0,
        hp: { current: 20, max: 20 },
        ac: 10,
        conditions: []
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
                    <Button size="sm" variant="outline" onClick={onRevealAllFog}>
                      Раскрыть весь туман
                    </Button>
                    <Button size="sm" variant="outline" onClick={onResetFog}>
                      Сбросить туман
                    </Button>
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
          compactMode={true}
          isDM={isDM}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          setSelectedTokenId={onSelectToken}
        />
      </Card>
    </div>
  );
};

export default RightPanel;
