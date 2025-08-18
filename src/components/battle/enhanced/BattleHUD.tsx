import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Settings,
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
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-700 text-white shadow-2xl z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-amber-400 mb-1">
              Раунд {currentRound}
            </h1>
            <p className="text-sm text-slate-400">
              {combatStarted ? 'Бой идёт' : 'Подготовка к бою'}
            </p>
          </div>
          
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
        </div>

        <div className="flex-1 overflow-auto">
          {/* Initiative Tracker */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-400">Инициатива</h3>
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
            
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {initiativeOrder.map((tokenId) => {
                  const token = tokens.find(t => t.id === tokenId);
                  if (!token) return null;
                  
                  const isActive = tokenId === activeId;
                  const hpPercentage = (token.hp / token.maxHp) * 100;
                  
                  return (
                    <div
                      key={tokenId}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-green-900/50 border-green-500 ring-2 ring-green-500/30'
                          : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            token.isEnemy ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <span className="font-medium">{token.name}</span>
                          {isActive && <Badge variant="secondary" className="text-xs">Ход</Badge>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{token.ac}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-3 h-3 text-red-400" />
                        <Progress value={hpPercentage} className="flex-1 h-2" />
                        <span className="text-xs text-slate-400">
                          {token.hp}/{token.maxHp}
                        </span>
                      </div>
                      
                      {token.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {token.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Token Visibility */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">
              Видимость токенов
            </h3>
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      token.isEnemy ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm">{token.name}</span>
                  </div>
                  <Button
                    onClick={() => setTokenVisibility(token.id, !(token.isVisible !== false))}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {token.isVisible !== false ? (
                      <Eye className="w-4 h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-400" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Fog of War Controls */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-400">Туман войны</h3>
              <Button
                onClick={() => toggleFog()}
                variant={fogEnabled ? "default" : "outline"}
                size="sm"
                className={fogEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Cloud className="w-4 h-4 mr-2" />
                {fogEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setFogMode('reveal')}
                  variant={fogMode === 'reveal' ? "default" : "outline"}
                  size="sm"
                  className={fogMode === 'reveal' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <Brush className="w-4 h-4 mr-2" />
                  Открыть
                </Button>
                <Button
                  onClick={() => setFogMode('hide')}
                  variant={fogMode === 'hide' ? "default" : "outline"}
                  size="sm"
                  className={fogMode === 'hide' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Скрыть
                </Button>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Размер кисти: <span className="text-amber-400 font-semibold">{fogBrushSize}px</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={120}
                  value={fogBrushSize}
                  onChange={(e) => setFogBrushSize(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              
              <div className="text-xs text-slate-400 space-y-1">
                <div>💡 Зажмите Shift - принудительно открыть</div>
                <div>💡 Зажмите Alt - принудительно скрыть</div>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-400">Лог боя</h3>
              <Button
                onClick={clearCombatLog}
                variant="outline"
                size="sm"
              >
                Очистить
              </Button>
            </div>
            
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {combatLog.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-4">
                    События боя будут отображаться здесь
                  </div>
                ) : (
                  combatLog.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-slate-800 p-2 rounded border-l-2 border-slate-600"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sword className="w-3 h-3 text-orange-400" />
                        <span className="font-medium text-slate-200">
                          {event.actor}
                        </span>
                        <span className="text-slate-400">
                          {event.action}
                        </span>
                        {event.target && (
                          <span className="text-slate-300">
                            → {event.target}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">{event.description}</div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};