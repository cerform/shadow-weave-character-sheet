import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useCombatStore } from '@/stores/combatStore';
import useBattleStore from '@/stores/battleStore';

export const CombatManager: React.FC = () => {
  const {
    isInCombat,
    currentRound,
    currentTurn,
    initiative,
    startCombat,
    endCombat,
    nextTurn,
    previousTurn,
    getCurrentToken
  } = useCombatStore();

  const { tokens, isDM } = useBattleStore();
  const currentToken = getCurrentToken();

  const handleStartCombat = () => {
    if (tokens.length === 0) {
      return;
    }
    startCombat(tokens);
  };

  if (!isDM) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Менеджер боя</span>
          <Badge variant={isInCombat ? "default" : "secondary"}>
            {isInCombat ? `Раунд ${currentRound}` : 'Не активен'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isInCombat ? (
          <Button 
            onClick={handleStartCombat} 
            disabled={tokens.length === 0}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Начать бой
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={previousTurn}
                variant="outline"
                size="sm"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={nextTurn}
                size="sm"
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Следующий ход
              </Button>
              <Button
                onClick={endCombat}
                variant="destructive"
                size="sm"
              >
                <Pause className="w-4 h-4" />
              </Button>
            </div>

            {currentToken && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Текущий ход:</div>
                <div className="text-lg font-bold text-primary">
                  {currentToken.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Инициатива: {currentToken.roll}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Порядок инициативы:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {initiative.map((init, index) => (
                  <div
                    key={init.id}
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      init.isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <span>{init.name}</span>
                    <Badge variant="outline" className={init.isActive ? 'border-primary-foreground' : ''}>
                      {init.roll}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};