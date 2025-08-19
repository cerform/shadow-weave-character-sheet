import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Eye, 
  EyeOff, 
  Cloud, 
  Brush, 
  Eraser,
  Sword,
  Shield,
  Heart,
  Dice6,
  Trash2,
  Zap,
  Activity
} from 'lucide-react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

export const BattleHUD: React.FC = () => {
  const {
    tokens,
    activeId,
    initiativeOrder,
    currentRound,
    combatStarted,
    fogEnabled,
    fogBrushSize,
    fogMode,
    combatLog,
    nextTurn,
    previousTurn,
    startCombat,
    endCombat,
    setTokenVisibility,
    toggleFog,
    setFogBrushSize,
    setFogMode,
    clearCombatLog,
  } = useEnhancedBattleStore();

  const activeToken = tokens.find(t => t.id === activeId);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'атака':
      case 'attack':
        return <Sword className="w-3 h-3" />;
      case 'заклинание':
      case 'spell':
        return <Zap className="w-3 h-3" />;
      case 'защита':
      case 'defend':
        return <Shield className="w-3 h-3" />;
      case 'лечение':
      case 'heal':
        return <Heart className="w-3 h-3" />;
      case 'перемещение':
      case 'movement':
        return <Activity className="w-3 h-3" />;
      case 'бросок кубика':
      case 'dice roll':
        return <Dice6 className="w-3 h-3" />;
      default:
        return <span>•</span>;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'атака':
      case 'attack':
        return 'destructive';
      case 'заклинание':
      case 'spell':
        return 'secondary';
      case 'защита':
      case 'defend':
        return 'outline';
      case 'лечение':
      case 'heal':
        return 'default';
      case 'перемещение':
      case 'movement':
        return 'default';
      case 'бросок кубика':
      case 'dice roll':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Combat Log - Positioned at the top */}
      <Card className="w-80 bg-background/95 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Расширенный лог боя
            </CardTitle>
            {combatLog.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCombatLog}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="max-h-64 overflow-y-auto">
          <ScrollArea className="h-full pr-4">
            {combatLog.length === 0 ? (
              <div className="text-muted-foreground text-center py-8 text-sm">
                Лог боя пуст. Все действия и броски кубиков будут отображаться здесь.
              </div>
            ) : (
              <div className="space-y-2">
                {combatLog.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getActionColor(event.action) as any}
                          className="flex items-center gap-1 text-xs"
                        >
                          {getActionIcon(event.action)}
                          {event.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          {event.playerName || event.actor}
                        </span>
                        {event.target && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-foreground">
                              {event.target}
                            </span>
                          </>
                        )}
                        {event.damage && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {event.damage} урона
                          </Badge>
                        )}
                      </div>
                      
                      {/* Dice Roll Information */}
                      {event.diceRoll && (
                        <div className="flex items-center gap-2 text-xs bg-secondary/50 rounded p-1">
                          <Dice6 className="w-3 h-3 text-primary" />
                          <span className="font-mono">{event.diceRoll.dice}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-bold text-primary">{event.diceRoll.result}</span>
                          {event.diceRoll.breakdown && (
                            <span className="text-muted-foreground">({event.diceRoll.breakdown})</span>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {event.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="w-80 bg-background/95 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Боевой HUD</span>
            <Badge variant={combatStarted ? "destructive" : "secondary"}>
              {combatStarted ? "Бой" : "Ожидание"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* Combat Controls */}
        <div className="flex gap-2">
          <Button
            onClick={combatStarted ? endCombat : startCombat}
            className={`flex-1 ${
              combatStarted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            size="sm"
          >
            {combatStarted ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {combatStarted ? 'Завершить' : 'Начать'}
          </Button>
        </div>

        {/* Initiative Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Инициатива - Раунд {currentRound}</h4>
            <div className="flex gap-1">
              <Button
                onClick={previousTurn}
                disabled={!combatStarted}
                variant="outline"
                size="sm"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={nextTurn}
                disabled={!combatStarted}
                variant="outline"
                size="sm"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {initiativeOrder.map((tokenId) => {
                const token = tokens.find(t => t.id === tokenId);
                if (!token) return null;
                
                const isActive = tokenId === activeId;
                const hpPercentage = (token.hp / token.maxHp) * 100;
                
                return (
                  <div
                    key={tokenId}
                    className={`p-2 rounded border transition-all text-sm ${
                      isActive
                        ? 'bg-primary/20 border-primary'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          token.isEnemy ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-medium">{token.name}</span>
                        {isActive && <Badge variant="secondary" className="text-xs">Ход</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs">{token.ac}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Heart className="w-3 h-3 text-red-400" />
                      <Progress value={hpPercentage} className="flex-1 h-1" />
                      <span className="text-xs text-muted-foreground">
                        {token.hp}/{token.maxHp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Fog Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Туман войны</h4>
            <Button
              onClick={() => toggleFog()}
              variant={fogEnabled ? "default" : "outline"}
              size="sm"
            >
              <Cloud className="w-4 h-4 mr-1" />
              {fogEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setFogMode('reveal')}
              variant={fogMode === 'reveal' ? "default" : "outline"}
              size="sm"
            >
              <Brush className="w-4 h-4 mr-1" />
              Открыть
            </Button>
            <Button
              onClick={() => setFogMode('hide')}
              variant={fogMode === 'hide' ? "default" : "outline"}
              size="sm"
            >
              <Eraser className="w-4 h-4 mr-1" />
              Скрыть
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};