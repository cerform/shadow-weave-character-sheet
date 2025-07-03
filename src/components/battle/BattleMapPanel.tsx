
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { socketService, BattleToken } from '@/services/socket';
import BattleCanvas from './BattleCanvas';
import TokenManager from './TokenManager';
import MapUploader from '../session/MapUploader';
import { Map, Users, Swords, Plus, Shield, Zap } from 'lucide-react';

interface BattleMapPanelProps {
  isDM?: boolean;
  sessionId?: string;
}

const BattleMapPanel: React.FC<BattleMapPanelProps> = ({ 
  isDM = false,
  sessionId
}) => {
  const [tokens, setTokens] = useState<BattleToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [mapBackground, setMapBackground] = useState<string | null>(null);

  useEffect(() => {
    // Подписываемся на события боевой карты
    const handleBattleEvent = (data: any) => {
      console.log('⚔️ Событие боевой карты:', data.type);
      
      switch (data.type) {
        case 'token_add':
          setTokens(prev => [...prev, data.token]);
          break;
        case 'token_move':
          setTokens(prev => prev.map(token =>
            token.id === data.tokenId ? { ...token, x: data.x, y: data.y } : token
          ));
          break;
        case 'token_update':
          setTokens(prev => prev.map(token =>
            token.id === data.tokenId ? { ...token, ...data.updates } : token
          ));
          break;
        case 'token_delete':
          setTokens(prev => prev.filter(token => token.id !== data.tokenId));
          if (selectedTokenId === data.tokenId) {
            setSelectedTokenId(null);
          }
          break;
        case 'battle_state_change':
          setIsBattleActive(data.active);
          break;
        case 'battle_clear':
          setTokens([]);
          setSelectedTokenId(null);
          break;
      }
    };

    socketService.onBattleEvent(handleBattleEvent);
    
    return () => {
      socketService.removeBattleListener(handleBattleEvent);
    };
  }, [selectedTokenId]);

  // Добавление нового токена
  const handleTokenAdd = (tokenData: Omit<BattleToken, 'id'>) => {
    const newToken: BattleToken = {
      ...tokenData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    if (isDM) {
      socketService.addBattleToken(newToken);
    }
  };

  // Обновление токена
  const handleTokenUpdate = (tokenId: string, updates: Partial<BattleToken>) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    ));
    
    // Отправляем через сокеты только если это DM
    if (isDM && sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_update',
        tokenId,
        updates
      }), 'system');
    }
  };

  // Перемещение токена
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    // Разрешаем игрокам двигать только свои токены
    const token = tokens.find(t => t.id === tokenId);
    if (!isDM && token?.type !== 'player') {
      return; // Игрок не может двигать не свои токены
    }

    socketService.moveBattleToken(tokenId, x, y);
  };

  // Удаление токена (только DM)
  const handleTokenDelete = (tokenId: string) => {
    if (!isDM) return;
    
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null);
    }
    
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_delete',
        tokenId
      }), 'system');
    }
  };

  // Начало/окончание боя (только DM)
  const toggleBattle = () => {
    if (!isDM) return;
    
    const newState = !isBattleActive;
    setIsBattleActive(newState);
    
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_state_change',
        active: newState
      }), 'system');
      
      // Отправляем системное сообщение
      socketService.sendMessage(
        newState ? '⚔️ **Бой начался!** Все на позиции!' : '🏁 **Бой завершен!** Можно расслабиться.',
        'system'
      );
    }
  };

  // Очистка карты (только DM)
  const clearMap = () => {
    if (!isDM) return;
    
    setTokens([]);
    setSelectedTokenId(null);
    
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_clear'
      }), 'system');
    }
  };

  // Добавление тестовых токенов (только для DM)
  const addTestTokens = () => {
    if (!isDM) return;
    
    const testTokens: Omit<BattleToken, 'id'>[] = [
      {
        name: '🛡️ Паладин',
        x: 120,
        y: 120,
        color: '#3B82F6',
        size: 1,
        type: 'player',
        hp: 35,
        maxHp: 35
      },
      {
        name: '🔮 Волшебник',
        x: 180,
        y: 120,
        color: '#8B5CF6',
        size: 1,
        type: 'player',
        hp: 22,
        maxHp: 25
      },
      {
        name: '🏹 Следопыт',
        x: 240,
        y: 120,
        color: '#10B981',
        size: 1,
        type: 'player',
        hp: 28,
        maxHp: 30
      },
      {
        name: '⚔️ Орк-воин',
        x: 360,
        y: 240,
        color: '#EF4444',
        size: 1,
        type: 'monster',
        hp: 15,
        maxHp: 15
      },
      {
        name: '🗡️ Гоблин-лучник',
        x: 420,
        y: 180,
        color: '#F59E0B',
        size: 1,
        type: 'monster',
        hp: 7,
        maxHp: 7
      },
      {
        name: '🐉 Молодой дракон',
        x: 480,
        y: 300,
        color: '#DC2626',
        size: 2,
        type: 'monster',
        hp: 75,
        maxHp: 75
      }
    ];
    
    testTokens.forEach(tokenData => handleTokenAdd(tokenData));
  };

  return (
    <div className="space-y-4">
      {/* Заголовок и управление */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <span>⚔️ Боевая карта</span>
              {isBattleActive && (
                <Badge variant="destructive" className="animate-pulse">
                  <Swords className="h-3 w-3 mr-1" />
                  Бой активен
                </Badge>
              )}
            </div>
            {isDM && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={addTestTokens}>
                  <Plus className="h-4 w-4 mr-1" />
                  Тест
                </Button>
                <Button size="sm" variant="outline" onClick={clearMap}>
                  🗑️ Очистить
                </Button>
                <Button
                  size="sm"
                  variant={isBattleActive ? "destructive" : "default"}
                  onClick={toggleBattle}
                >
                  {isBattleActive ? (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      Завершить бой
                    </>
                  ) : (
                    <>
                      <Swords className="h-4 w-4 mr-1" />
                      Начать бой
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Токенов: {tokens.length}</span>
            </div>
            {selectedTokenId && (
              <Badge variant="outline">
                🎯 Выбран: {tokens.find(t => t.id === selectedTokenId)?.name}
              </Badge>
            )}
            {!isDM && (
              <Badge variant="secondary">
                👁️ Режим игрока
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Основная область */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Боевая карта */}
        <div className="lg:col-span-3">
          <BattleCanvas
            width={800}
            height={600}
            gridSize={30}
            isDM={isDM}
            tokens={tokens}
            onTokenMove={handleTokenMove}
            onTokenAdd={isDM ? handleTokenAdd : undefined}
            onTokenSelect={setSelectedTokenId}
          />
        </div>

        {/* Панель управления токенами */}
        {isDM && (
          <div className="lg:col-span-1 space-y-4">
            <TokenManager
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onTokenUpdate={handleTokenUpdate}
              onTokenDelete={handleTokenDelete}
              onTokenAdd={handleTokenAdd}
              onTokenSelect={setSelectedTokenId}
            />
            <MapUploader 
              onMapUpload={setMapBackground}
              currentMap={mapBackground}
            />
          </div>
        )}

        {/* Информация для игроков */}
        {!isDM && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ваши персонажи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tokens.filter(t => t.type === 'player').map(token => (
                    <div
                      key={token.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedTokenId === token.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedTokenId(token.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-sm font-medium">{token.name}</span>
                      </div>
                      {token.hp !== undefined && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            ❤️ {token.hp}/{token.maxHp}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {tokens.filter(t => t.type === 'player').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет ваших персонажей на карте</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMapPanel;
