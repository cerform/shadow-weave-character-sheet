
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { Initiative, TokenData } from '@/types/session.types';
import EnhancedBattleMap from '@/components/battle/EnhancedBattleMap';

// Функция для преобразования типов инициативы
const convertInitiative = (init: Initiative[]): Initiative[] => {
  return init.map(item => ({
    id: String(item.id),
    name: item.name,
    initiative: item.roll || 0,
    roll: item.roll || 0,
    isActive: item.isActive,
    tokenId: item.tokenId ? String(item.tokenId) : undefined
  }));
};

// Компонент страницы боевой сцены
const BattleScenePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [background, setBackground] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [battleActive, setBattleActive] = useState(false);
  const { socket } = useSocket();

  // Загрузка данных карты при инициализации
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('getBattleMap', { sessionId }, (response: any) => {
        if (response.success) {
          if (response.data.tokens) {
            setTokens(response.data.tokens);
          }
          if (response.data.background) {
            setBackground(response.data.background);
          }
          if (response.data.initiative) {
            setInitiative(response.data.initiative);
          }
          if (response.data.battleActive !== undefined) {
            setBattleActive(response.data.battleActive);
          }
        }
      });
    }
  }, [socket, sessionId]);

  // Обработчик обновления позиции токена
  const updateTokenPosition = (id: number, x: number, y: number) => {
    const updatedTokens = tokens.map(token => 
      token.id === String(id) ? { ...token, x, y } : token
    );
    setTokens(updatedTokens);
    
    if (socket && sessionId) {
      socket.emit('updateBattleMap', { 
        sessionId, 
        tokens: updatedTokens 
      });
    }
  };

  // Обновление токенов и отправка на сервер
  const handleUpdateTokens = (newTokens: TokenData[]) => {
    setTokens(newTokens);
    if (socket && sessionId) {
      socket.emit('updateBattleMap', { sessionId, tokens: newTokens });
    }
  };

  // Обновление фона карты
  const handleUpdateBackground = (url: string | null) => {
    setBackground(url);
    if (socket && sessionId) {
      socket.emit('updateBattleMap', { sessionId, background: url });
    }
  };

  // Рендер компонента
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Боевая сцена</h1>
        <Button variant="outline" onClick={() => history.back()}>
          Назад к сессии
        </Button>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <EnhancedBattleMap
          tokens={tokens.map(t => ({
            ...t,
            id: String(t.id) // Преобразование ID в строку
          }))}
          setTokens={handleUpdateTokens}
          background={background}
          setBackground={handleUpdateBackground}
          onUpdateTokenPosition={(id, x, y) => updateTokenPosition(Number(id), x, y)}
          onSelectToken={(id) => setSelectedTokenId(id ? Number(id) : null)}
          selectedTokenId={selectedTokenId ? String(selectedTokenId) : null}
          initiative={convertInitiative(initiative)}
          battleActive={battleActive}
        />
      </Card>
    </div>
  );
};

export default BattleScenePage;
