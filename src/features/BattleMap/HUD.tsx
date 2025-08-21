/**
 * HUD боевой карты
 * Очередь инициативы, кнопки действий, индикатор состояний
 * Все подписи на русском языке
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useBattleController } from './hooks/useBattleController';
import ruTranslations from '@/i18n/ru.json';
import { 
  Sword, 
  Move, 
  Sparkles, 
  Package, 
  Shield, 
  Heart,
  SkipForward,
  Clock,
  Crown,
  Users
} from 'lucide-react';

interface HUDProps {
  className?: string;
  isDM?: boolean;
}

export const HUD: React.FC<HUDProps> = ({ className = '', isDM = false }) => {
  const {
    getBattleState,
    getInitiativeOrder,
    getToken,
    nextTurn,
    performAttack,
    healToken,
    startBattle,
    endBattle,
  } = useBattleController();

  const battleState = getBattleState();
  const initiativeOrder = getInitiativeOrder();
  const currentToken = battleState?.currentTokenId ? getToken(battleState.currentTokenId) : null;
  const isInCombat = battleState?.isActive || false;

  const t = ruTranslations.battle;

  // Обработчики действий
  const handleAttack = () => {
    if (!currentToken) return;
    // TODO: открыть модал выбора цели
    console.log('🗡️ Attack action');
  };

  const handleMove = () => {
    if (!currentToken) return;
    console.log('🚶 Movement action');
  };

  const handleSpell = () => {
    if (!currentToken) return;
    console.log('✨ Spell action');
  };

  const handleItem = () => {
    if (!currentToken) return;
    console.log('📦 Item action');
  };

  const handleDefend = () => {
    if (!currentToken) return;
    console.log('🛡️ Defend action');
  };

  const handleHeal = () => {
    if (!currentToken) return;
    healToken(currentToken.id, 5); // Базовое лечение
  };

  const handleEndTurn = () => {
    nextTurn();
  };

  return (
    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 ${className}`}>
      <Card className="bg-background/90 backdrop-blur-sm border shadow-lg min-w-96">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {isInCombat ? `${t.title} - ${t.round} ${battleState?.round || 0}` : t.title}
            </div>
            
            <div className="flex items-center gap-2">
              {!isInCombat ? (
                <Button size="sm" onClick={startBattle} disabled={initiativeOrder.length === 0}>
                  <Sword className="w-4 h-4 mr-1" />
                  Начать бой
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={endBattle}>
                  Завершить бой
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Информация о текущем ходе */}
          {isInCombat && currentToken && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {currentToken.isEnemy ? (
                    <Crown className="w-4 h-4 text-red-500" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="font-medium">{currentToken.name}</span>
                </div>
                <Badge variant={currentToken.isEnemy ? 'destructive' : 'default'}>
                  {currentToken.isEnemy ? 'Враг' : 'Игрок'}
                </Badge>
              </div>
              
              {/* HP и AC */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{currentToken.hp}/{currentToken.maxHp}</span>
                  <Progress 
                    value={(currentToken.hp / currentToken.maxHp) * 100}
                    className="w-16 h-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>AC {currentToken.ac}</span>
                </div>
              </div>
            </div>
          )}

          {/* Порядок инициативы */}
          {initiativeOrder.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t.initiative}
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {initiativeOrder.map((entry, index) => (
                  <div
                    key={entry.tokenId}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      battleState?.currentTokenId === entry.tokenId
                        ? 'bg-primary text-primary-foreground'
                        : entry.hasActed
                        ? 'bg-muted/50 text-muted-foreground'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-4 text-center">{index + 1}</span>
                      <span>{entry.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.initiative}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Панель действий */}
          {isInCombat && currentToken && (isDM || !currentToken.isEnemy) && (
            <div>
              <Separator />
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">Действия</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMove}
                    className="flex items-center gap-1"
                  >
                    <Move className="w-4 h-4" />
                    {t.actions.move}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAttack}
                    className="flex items-center gap-1"
                  >
                    <Sword className="w-4 h-4" />
                    {t.actions.attack}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSpell}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.actions.spell}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleItem}
                    className="flex items-center gap-1"
                  >
                    <Package className="w-4 h-4" />
                    {t.actions.item}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDefend}
                    className="flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    {t.actions.defend}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleHeal}
                    className="flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    {t.actions.heal}
                  </Button>
                </div>
                
                {/* Завершить ход */}
                <Button 
                  className="w-full mt-2"
                  onClick={handleEndTurn}
                  size="sm"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  {t.actions.endTurn}
                </Button>
              </div>
            </div>
          )}

          {/* Состояния активного токена */}
          {currentToken && currentToken.conditions.length > 0 && (
            <div>
              <Separator />
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">Состояния</h4>
                <div className="flex flex-wrap gap-1">
                  {currentToken.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};