import React, { useState } from 'react';
import { PlayerProfile } from './PlayerProfile';
import { PlayerActionsPanel } from './PlayerActionsPanel';
import { PlayerTokensList } from './PlayerTokensList';
import { VideoChat } from '../VideoChat';
import BattleMap2DPlayer from '../BattleMap2DPlayer';
import { EnhancedToken, useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlayerBattleInterfaceProps {
  sessionId: string;
  sessionCode?: string;
}

export const PlayerBattleInterface: React.FC<PlayerBattleInterfaceProps> = ({
  sessionId,
  sessionCode
}) => {
  const { user } = useAuth();
  const { tokens, mapImageUrl, addToken, updateToken } = useEnhancedBattleStore();
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [showTokensList, setShowTokensList] = useState(true);

  // Найти токен игрока
  const playerToken = tokens.find(t => t.owner_id === user?.id && !t.is_summoned);
  
  // Все видимые токены (персонажи + призванные существа игрока)
  const visibleTokens = tokens.filter(t => 
    t.isVisible && (!t.isEnemy || t.owner_id === user?.id)
  );

  const handleAvatarUpdate = (url: string) => {
    if (playerToken) {
      updateToken(playerToken.id, { avatarUrl: url, image_url: url });
    }
  };

  const handleAction = (actionType: string, data?: any) => {
    console.log('Player action:', actionType, data);
    // Здесь можно добавить логику отправки действий DM
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Верхняя панель - видеочат (опционально) */}
      {showVideoChat && (
        <div className="border-b border-border">
          <div className="max-h-48 overflow-hidden">
            <VideoChat
              sessionId={sessionId}
              playerName={playerToken?.name || 'Игрок'}
              isDM={false}
              onClose={() => setShowVideoChat(false)}
            />
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель - профиль и группа */}
        <div className="w-80 border-r border-border flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Профиль игрока */}
              <PlayerProfile
                token={playerToken}
                sessionId={sessionId}
                onAvatarUpdate={handleAvatarUpdate}
              />

              {/* Информация о сессии */}
              {sessionCode && (
                <Card>
                  <CardContent className="py-3 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Код сессии:
                    </div>
                    <div className="font-mono font-bold text-lg text-center p-2 bg-primary/10 rounded">
                      {sessionCode}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Список токенов группы */}
              {showTokensList && (
                <PlayerTokensList
                  tokens={visibleTokens}
                  currentToken={playerToken}
                />
              )}
            </div>
          </ScrollArea>

          {/* Кнопки управления */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant={showVideoChat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowVideoChat(!showVideoChat)}
              className="w-full"
            >
              {showVideoChat ? <VideoOff className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
              {showVideoChat ? 'Скрыть камеры' : 'Показать камеры'}
            </Button>
            <Button
              variant={showTokensList ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTokensList(!showTokensList)}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              {showTokensList ? 'Скрыть группу' : 'Показать группу'}
            </Button>
          </div>
        </div>

        {/* Центр - карта */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <BattleMap2DPlayer
              sessionId={sessionId}
              mapImageUrl={mapImageUrl}
              tokens={visibleTokens}
            />
          </div>

          {/* Нижняя панель - действия */}
          <div className="border-t border-border">
            <PlayerActionsPanel
              token={playerToken}
              sessionId={sessionId}
              onAction={handleAction}
              onSummon={addToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
