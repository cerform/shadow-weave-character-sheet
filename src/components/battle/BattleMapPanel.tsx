
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { socketService } from '@/services/socket';
import BattleCanvas from './BattleCanvas';
import TokenManager from './TokenManager';
import { Map, Users, Swords } from 'lucide-react';

interface Token {
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
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);

  // Добавление нового токена
  const handleTokenAdd = (tokenData: Omit<Token, 'id'>) => {
    const newToken: Token = {
      ...tokenData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    setTokens(prev => [...prev, newToken]);
    
    // Отправляем обновление через сокеты
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_add',
        token: newToken
      }), 'system');
    }
  };

  // Обновление токена
  const handleTokenUpdate = (tokenId: string, updates: Partial<Token>) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    ));
    
    // Отправляем обновление через сокеты
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_update',
        tokenId,
        updates
      }), 'system');
    }
  };

  // Перемещение токена
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, x, y } : token
    ));
    
    // Отправляем обновление через сокеты
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_move',
        tokenId,
        x,
        y
      }), 'system');
    }
  };

  // Удаление токена
  const handleTokenDelete = (tokenId: string) => {
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null);
    }
    
    // Отправляем обновление через сокеты
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_token_delete',
        tokenId
      }), 'system');
    }
  };

  // Начало/окончание боя
  const toggleBattle = () => {
    setIsBattleActive(!isBattleActive);
    
    if (sessionId) {
      socketService.sendMessage(JSON.stringify({
        type: 'battle_state_change',
        active: !isBattleActive
      }), 'system');
    }
  };

  // Очистка карты
  const clearMap = () => {
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
    const testTokens: Omit<Token, 'id'>[] = [
      {
        name: 'Игрок 1',
        x: 120,
        y: 120,
        color: '#0066FF',
        size: 1,
        type: 'player',
        hp: 25,
        maxHp: 25
      },
      {
        name: 'Орк',
        x: 300,
        y: 180,
        color: '#FF0000',
        size: 1,
        type: 'monster',
        hp: 15,
        maxHp: 15
      },
      {
        name: 'Торговец',
        x: 480,
        y: 120,
        color: '#00AA00',
        size: 1,
        type: 'npc'
      }
    ];
    
    testTokens.forEach(tokenData => handleTokenAdd(tokenData));
  };

  // Слушаем сообщения о боевой карте
  useEffect(() => {
    const handleBattleMessage = (message: any) => {
      if (message.type !== 'system') return;
      
      try {
        const data = JSON.parse(message.content);
        
        switch (data.type) {
          case 'battle_token_add':
            setTokens(prev => [...prev, data.token]);
            break;
          case 'battle_token_update':
            setTokens(prev => prev.map(token =>
              token.id === data.tokenId ? { ...token, ...data.updates } : token
            ));
            break;
          case 'battle_token_move':
            setTokens(prev => prev.map(token =>
              token.id === data.tokenId ? { ...token, x: data.x, y: data.y } : token
            ));
            break;
          case 'battle_token_delete':
            setTokens(prev => prev.filter(token => token.id !== data.tokenId));
            break;
          case 'battle_state_change':
            setIsBattleActive(data.active);
            break;
          case 'battle_clear':
            setTokens([]);
            setSelectedTokenId(null);
            break;
        }
      } catch (error) {
        // Не системное сообщение, игнорируем
      }
    };

    socketService.onMessage(handleBattleMessage);
    
    return () => {
      socketService.removeMessageListener(handleBattleMessage);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Заголовок и управление */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <span>Боевая карта</span>
              {isBattleActive && (
                <Badge variant="destructive" className="animate-pulse">
                  <Swords className="h-3 w-3 mr-1" />
                  Бой
                </Badge>
              )}
            </div>
            {isDM && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={addTestTokens}>
                  Тест
                </Button>
                <Button size="sm" variant="outline" onClick={clearMap}>
                  Очистить
                </Button>
                <Button
                  size="sm"
                  variant={isBattleActive ? "destructive" : "default"}
                  onClick={toggleBattle}
                >
                  {isBattleActive ? "Завершить бой" : "Начать бой"}
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
                Выбран: {tokens.find(t => t.id === selectedTokenId)?.name}
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
          />
        </div>

        {/* Панель управления токенами */}
        {isDM && (
          <div className="lg:col-span-1">
            <TokenManager
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onTokenUpdate={handleTokenUpdate}
              onTokenDelete={handleTokenDelete}
              onTokenAdd={handleTokenAdd}
              onTokenSelect={setSelectedTokenId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMapPanel;
