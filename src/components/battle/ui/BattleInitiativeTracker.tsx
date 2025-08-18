import { useBattleUIStore } from "@/stores/battleUIStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Play, RotateCcw } from "lucide-react";

export default function BattleInitiativeTracker() {
  const { order, activeId, tokens, round, setInitiative, nextTurn, moveInInitiative } = useBattleUIStore();
  
  const byId = Object.fromEntries(tokens.map(t => [t.id, t]));

  const moveToken = (fromIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && fromIndex > 0) {
      moveInInitiative(fromIndex, fromIndex - 1);
    } else if (direction === 'down' && fromIndex < order.length - 1) {
      moveInInitiative(fromIndex, fromIndex + 1);
    }
  };

  const resetInitiative = () => {
    // Простой сброс - можно расширить логикой броска инициативы
    setInitiative(order, order[0]);
  };

  return (
    <Card className="fixed top-4 right-4 w-80 bg-card/90 backdrop-blur-sm border-border shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center justify-between">
          <span>Инициатива</span>
          <Badge variant="outline" className="text-primary">
            Раунд {round}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {order.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            Нет участников боя
          </div>
        ) : (
          order.map((id, index) => {
            const token = byId[id];
            const isActive = id === activeId;
            const isEnemy = token?.isEnemy;
            
            return (
              <div
                key={id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-primary/20 border-primary shadow-md' 
                    : 'bg-muted/50 border-border hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Индикатор активного хода */}
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                  
                  {/* Аватар токена */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isEnemy ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                  }`}>
                    {token?.name?.charAt(0) || '?'}
                  </div>
                  
                  {/* Информация о токене */}
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {token?.name || id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {token?.hp}/{token?.maxHp} HP
                    </div>
                  </div>
                </div>

                {/* Кнопки перемещения */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveToken(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveToken(index, 'down')}
                    disabled={index === order.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}

        {/* Кнопки управления */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <Button 
            onClick={nextTurn} 
            className="flex-1"
            disabled={order.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Следующий ход
          </Button>
          <Button 
            variant="outline" 
            onClick={resetInitiative}
            disabled={order.length === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}