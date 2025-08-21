// Система инициативы для боевых действий
import React, { useState, useMemo } from 'react';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Dice6, 
  Crown,
  Swords,
  Heart,
  Shield
} from 'lucide-react';

interface InitiativeSystemProps {
  className?: string;
}

export const InitiativeSystem: React.FC<InitiativeSystemProps> = ({ className = '' }) => {
  const { 
    tokens, 
    activeId, 
    setActiveToken, 
    updateToken, 
    combatStarted, 
    startCombat, 
    endCombat,
    addCombatEvent 
  } = useUnifiedBattleStore();

  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [manualInitiative, setManualInitiative] = useState<Record<string, number>>({});

  // Сортированный список инициативы
  const initiativeOrder = useMemo(() => {
    return [...tokens]
      .filter(token => token.initiative !== undefined)
      .sort((a, b) => {
        const aInit = manualInitiative[a.id] ?? a.initiative ?? 0;
        const bInit = manualInitiative[b.id] ?? b.initiative ?? 0;
        return bInit - aInit; // По убыванию
      });
  }, [tokens, manualInitiative]);

  // Текущий активный токен
  const currentToken = initiativeOrder[currentTurnIndex] || null;

  // Автобросок инициативы для всех токенов
  const rollInitiativeForAll = () => {
    tokens.forEach(token => {
      const roll = Math.floor(Math.random() * 20) + 1;
      updateToken(token.id, { initiative: roll });
      
      addCombatEvent({
        actor: token.name,
        action: 'Инициатива',
        description: `${token.name} бросил инициативу: ${roll}`,
        playerName: token.name
      });
    });

    setCurrentTurnIndex(0);
    setCurrentRound(1);
    
    addCombatEvent({
      actor: 'Система',
      action: 'Начало боя',
      description: 'Бой начался! Инициатива брошена для всех участников',
      playerName: 'Система'
    });
  };

  // Начало боя
  const handleStartCombat = () => {
    if (tokens.length === 0) {
      alert('Нет токенов для начала боя!');
      return;
    }

    rollInitiativeForAll();
    startCombat();
    
    if (initiativeOrder.length > 0) {
      setActiveToken(initiativeOrder[0].id);
    }
  };

  // Конец боя
  const handleEndCombat = () => {
    endCombat();
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setManualInitiative({});
    
    // Сбрасываем флаги ходов
    tokens.forEach(token => {
      updateToken(token.id, { hasMovedThisTurn: false });
    });
    
    addCombatEvent({
      actor: 'Система',
      action: 'Конец боя',
      description: 'Бой завершен',
      playerName: 'Система'
    });
  };

  // Следующий ход
  const nextTurn = () => {
    if (initiativeOrder.length === 0) return;

    let nextIndex = (currentTurnIndex + 1) % initiativeOrder.length;
    
    // Если начался новый раунд
    if (nextIndex === 0) {
      setCurrentRound(prev => prev + 1);
      
      // Сбрасываем флаги ходов для нового раунда
      tokens.forEach(token => {
        updateToken(token.id, { hasMovedThisTurn: false });
      });
      
      addCombatEvent({
        actor: 'Система',
        action: 'Новый раунд',
        description: `Начался раунд ${currentRound + 1}`,
        playerName: 'Система'
      });
    }

    setCurrentTurnIndex(nextIndex);
    const nextToken = initiativeOrder[nextIndex];
    if (nextToken) {
      setActiveToken(nextToken.id);
      
      addCombatEvent({
        actor: nextToken.name,
        action: 'Ход',
        description: `Ход переходит к ${nextToken.name}`,
        playerName: nextToken.name
      });
    }
  };

  // Ручное изменение инициативы
  const handleManualInitiative = (tokenId: string, value: number) => {
    setManualInitiative(prev => ({ ...prev, [tokenId]: value }));
    
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      addCombatEvent({
        actor: 'ДМ',
        action: 'Изменение инициативы',
        description: `Инициатива ${token.name} изменена на ${value}`,
        playerName: 'Мастер'
      });
    }
  };

  // Бросок инициативы для конкретного токена
  const rollInitiativeForToken = (tokenId: string) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    updateToken(tokenId, { initiative: roll });
    setManualInitiative(prev => {
      const newState = { ...prev };
      delete newState[tokenId];
      return newState;
    });

    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      addCombatEvent({
        actor: token.name,
        action: 'Инициатива',
        description: `${token.name} перебросил инициативу: ${roll}`,
        playerName: token.name
      });
    }
  };

  return (
    <Card className={`bg-neutral-900 border-neutral-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">Инициатива</span>
            {combatStarted && (
              <Badge variant="outline" className="text-xs">
                Раунд {currentRound}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!combatStarted ? (
              <Button
                onClick={handleStartCombat}
                size="sm"
                className="text-xs h-7 bg-green-700 hover:bg-green-600"
                disabled={tokens.length === 0}
              >
                <Play className="w-3 h-3 mr-1" />
                Начать бой
              </Button>
            ) : (
              <>
                <Button
                  onClick={nextTurn}
                  size="sm"
                  className="text-xs h-7"
                  disabled={initiativeOrder.length === 0}
                >
                  <SkipForward className="w-3 h-3 mr-1" />
                  Следующий
                </Button>
                <Button
                  onClick={handleEndCombat}
                  size="sm"
                  variant="destructive"
                  className="text-xs h-7"
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Конец
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {tokens.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            Нет токенов на карте
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {initiativeOrder.map((token, index) => {
                const isActive = combatStarted && index === currentTurnIndex;
                const initiative = manualInitiative[token.id] ?? token.initiative ?? 0;
                
                return (
                  <div
                    key={token.id}
                    className={`p-2 rounded border transition-colors ${
                      isActive 
                        ? 'border-yellow-400 bg-yellow-400/10' 
                        : 'border-neutral-600 bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          token.isEnemy ? 'bg-red-400' : 'bg-blue-400'
                        }`} />
                        <span className={`font-medium text-sm ${
                          isActive ? 'text-yellow-400' : 'text-gray-200'
                        }`}>
                          {token.name}
                        </span>
                        {isActive && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                            Активен
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={initiative}
                          onChange={(e) => handleManualInitiative(token.id, parseInt(e.target.value) || 0)}
                          className="w-12 h-6 text-xs text-center bg-neutral-700 border-neutral-600"
                          min="1"
                          max="30"
                        />
                        <Button
                          onClick={() => rollInitiativeForToken(token.id)}
                          size="sm"
                          variant="ghost"
                          className="w-6 h-6 p-0"
                        >
                          <Dice6 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{token.class}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{token.hp}/{token.maxHp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{token.ac}</span>
                        </div>
                        {token.hasMovedThisTurn && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-3">
                            Ход сделан
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {!combatStarted && tokens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <Button
              onClick={rollInitiativeForAll}
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Перебросить инициативу для всех
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};