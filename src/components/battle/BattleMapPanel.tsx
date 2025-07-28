
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BattleCanvas from './BattleCanvas';
import TokenManager from './TokenManager';
import InitiativePanel from './InitiativePanel';
import MapUploader from '../session/MapUploader';
import { Map, Users, Swords, Plus, Shield, Zap } from 'lucide-react';
import PlayerViewPanel from './PlayerViewPanel';

// Локальный интерфейс токена без зависимости от socket
interface BattleToken {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
}

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

  // Инициализация тестовых данных
  useEffect(() => {
    console.log('🗺️ Инициализация боевой карты');
  }, []);

  // Добавление нового токена
  const handleTokenAdd = (tokenData: Omit<BattleToken, 'id'>) => {
    const newToken: BattleToken = {
      ...tokenData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    console.log('➕ Добавление токена:', newToken);
    setTokens(prev => [...prev, newToken]);
  };

  // Обновление токена
  const handleTokenUpdate = (tokenId: string, updates: Partial<BattleToken>) => {
    console.log('🔄 Обновление токена:', tokenId, updates);
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    ));
  };

  // Перемещение токена
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    // Блокируем перемещение токенов во время активного боя для игроков
    if (isBattleActive && !isDM) {
      return; // Во время боя только DM может двигать токены
    }

    // Разрешаем игрокам двигать только свои токены
    const token = tokens.find(t => t.id === tokenId);
    if (!isDM && token?.type !== 'player') {
      return; // Игрок не может двигать не свои токены
    }

    console.log('🚀 Перемещение токена:', tokenId, 'to', x, y);
    setTokens(prev => prev.map(token =>
      token.id === tokenId ? { ...token, x, y } : token
    ));
  };

  // Удаление токена (только DM)
  const handleTokenDelete = (tokenId: string) => {
    if (!isDM) return;
    
    console.log('🗑️ Удаление токена:', tokenId);
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null);
    }
  };

  // Начало/окончание боя (только DM)
  const toggleBattle = () => {
    if (!isDM) return;
    
    const newState = !isBattleActive;
    console.log('⚔️ Переключение боя:', newState ? 'НАЧАЛСЯ' : 'ЗАВЕРШИЛСЯ');
    setIsBattleActive(newState);
  };

  // Очистка карты (только DM)
  const clearMap = () => {
    if (!isDM) return;
    
    console.log('🧹 Очистка карты');
    setTokens([]);
    setSelectedTokenId(null);
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* Боевая карта */}
        <div className="lg:col-span-3 flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🗺️ Карта боя</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Токенов: {tokens.length}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BattleCanvas
                width={800}
                height={600}
                gridSize={32}
                isDM={isDM}
                tokens={tokens}
                onTokenMove={handleTokenMove}
                onTokenAdd={isDM ? handleTokenAdd : undefined}
                onTokenSelect={setSelectedTokenId}
              />
            </CardContent>
          </Card>
          
          {/* Кнопки управления боем для DM */}
          {isDM && (
            <div className="mt-4 flex gap-2 justify-center">
              <Button
                size="lg"
                variant={isBattleActive ? "destructive" : "default"}
                onClick={toggleBattle}
                className="min-w-32"
              >
                {isBattleActive ? (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Завершить бой
                  </>
                ) : (
                  <>
                    <Swords className="h-5 w-5 mr-2" />
                    Начать бой
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Панель управления токенами */}
        {isDM && (
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            {/* Панель инициативы - показывается только во время боя */}
            {isBattleActive && (
              <InitiativePanel
                tokens={tokens}
                isBattleActive={isBattleActive}
                onTokenSelect={setSelectedTokenId}
              />
            )}
            
            {/* Управление токенами */}
            <TokenManager
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onTokenUpdate={handleTokenUpdate}
              onTokenDelete={handleTokenDelete}
              onTokenAdd={handleTokenAdd} // Разрешаем добавление всегда для тестирования
              onTokenSelect={setSelectedTokenId}
            />
            
            {/* Загрузка карты */}
            {!isBattleActive && (
              <MapUploader 
                onMapUpload={setMapBackground}
                currentMap={mapBackground}
              />
            )}
            
            {/* Предпросмотр для игроков */}
            <PlayerViewPanel
              tokens={tokens}
              showPlayerView={isDM}
              mapBackground={mapBackground}
            />
          </div>
        )}

        {/* Информация для игроков */}
        {!isDM && (
          <div className="lg:col-span-1 space-y-4">
            {/* Панель инициативы для игроков */}
            {isBattleActive && (
              <InitiativePanel
                tokens={tokens}
                isBattleActive={isBattleActive}
                onTokenSelect={setSelectedTokenId}
              />
            )}
            
            {/* Персонажи игрока */}
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
                      } ${isBattleActive ? 'opacity-75' : ''}`}
                      onClick={() => setSelectedTokenId(token.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-sm font-medium">{token.name}</span>
                        {isBattleActive && (
                          <Badge variant="secondary" className="text-xs">
                            🔒 Заморожен
                          </Badge>
                        )}
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
