import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dice6, Crown, ArrowRight, Timer } from 'lucide-react';
import { BattleToken } from '@/services/socket';

interface InitiativeEntry {
  id: string;
  tokenId: string;
  name: string;
  initiative: number;
  isActive: boolean;
  color: string;
}

interface InitiativePanelProps {
  tokens: BattleToken[];
  isBattleActive: boolean;
  onTokenSelect: (tokenId: string | null) => void;
}

const InitiativePanel: React.FC<InitiativePanelProps> = ({
  tokens,
  isBattleActive,
  onTokenSelect
}) => {
  const [initiatives, setInitiatives] = useState<InitiativeEntry[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);

  // Инициализация инициативы при начале боя
  useEffect(() => {
    if (isBattleActive && initiatives.length === 0 && tokens.length > 0) {
      generateInitiatives();
    } else if (!isBattleActive) {
      setInitiatives([]);
      setCurrentTurn(0);
      setRound(1);
    }
  }, [isBattleActive, tokens]);

  const generateInitiatives = () => {
    const newInitiatives: InitiativeEntry[] = tokens.map((token, index) => ({
      id: `init-${token.id}`,
      tokenId: token.id,
      name: token.name,
      initiative: Math.floor(Math.random() * 20) + 1, // Бросок d20
      isActive: index === 0,
      color: token.color
    }));

    // Сортируем по инициативе (от большего к меньшему)
    newInitiatives.sort((a, b) => b.initiative - a.initiative);
    
    // Отмечаем первого как активного
    newInitiatives.forEach((init, index) => {
      init.isActive = index === 0;
    });

    setInitiatives(newInitiatives);
    setCurrentTurn(0);
  };

  const nextTurn = () => {
    if (initiatives.length === 0) return;

    const nextIndex = (currentTurn + 1) % initiatives.length;
    
    // Если вернулись к первому, увеличиваем раунд
    if (nextIndex === 0) {
      setRound(prev => prev + 1);
    }

    setCurrentTurn(nextIndex);

    // Обновляем активного
    setInitiatives(prev => prev.map((init, index) => ({
      ...init,
      isActive: index === nextIndex
    })));

    // Выбираем активный токен
    const activeToken = initiatives[nextIndex];
    if (activeToken) {
      onTokenSelect(activeToken.tokenId);
    }
  };

  const updateInitiative = (id: string, newValue: number) => {
    setInitiatives(prev => {
      const updated = prev.map(init => 
        init.id === id ? { ...init, initiative: newValue } : init
      );
      // Пересортировываем
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };

  const rollInitiative = (id: string) => {
    const newRoll = Math.floor(Math.random() * 20) + 1;
    updateInitiative(id, newRoll);
  };

  if (!isBattleActive) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span>Инициатива</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Раунд {round}</Badge>
            <Button size="sm" onClick={nextTurn} disabled={initiatives.length === 0}>
              <ArrowRight className="h-4 w-4 mr-1" />
              Следующий ход
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {initiatives.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Инициатива не определена</p>
            <Button size="sm" onClick={generateInitiatives} className="mt-2">
              <Dice6 className="h-4 w-4 mr-1" />
              Бросить инициативу
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {initiatives.map((init, index) => (
              <div
                key={init.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  init.isActive
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {init.isActive && (
                    <Crown className="h-4 w-4 text-primary animate-pulse" />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: init.color }}
                    />
                    <span className={`font-medium ${init.isActive ? 'text-primary' : ''}`}>
                      {init.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={init.initiative}
                      onChange={(e) => updateInitiative(init.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      min="1"
                      max="30"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rollInitiative(init.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Dice6 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {init.isActive && (
                    <Badge variant="default" className="animate-pulse">
                      Ход
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {initiatives.length > 0 && (
          <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Ход: {initiatives[currentTurn]?.name || 'Неизвестно'}
            </span>
            <Button size="sm" variant="outline" onClick={generateInitiatives}>
              <Dice6 className="h-4 w-4 mr-1" />
              Перебросить все
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InitiativePanel;