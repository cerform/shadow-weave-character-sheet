import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Heart
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

  return (
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
  );
};