import React, { useState, useEffect } from 'react';
import { PlayerProfile } from './PlayerProfile';
import { PlayerActionsPanel } from './PlayerActionsPanel';
import { PlayerTokensList } from './PlayerTokensList';
import { VideoChatMini } from './VideoChatMini';
import { CombatLogMini } from './CombatLogMini';
import BattleMap2DPlayer from '../BattleMap2DPlayer';
import { PlayerBattleInterfaceMobile } from './PlayerBattleInterfaceMobile';
import { EnhancedToken, useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Users, Eye, EyeOff, Smartphone, Monitor } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFogSync } from '@/hooks/useFogSync';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerBattleInterfaceProps {
  sessionId: string;
  sessionCode?: string;
}

export const PlayerBattleInterface: React.FC<PlayerBattleInterfaceProps> = ({
  sessionId,
  sessionCode
}) => {
  const { user } = useAuth();
  const { tokens, mapImageUrl, addToken, updateToken, combatLog } = useEnhancedBattleStore();
  const [showVideoChat, setShowVideoChat] = useState(true);
  const [showTokensList, setShowTokensList] = useState(true);
  const [showCombatLog, setShowCombatLog] = useState(true);
  const isMobileDevice = useIsMobile();
  const [forceMobileMode, setForceMobileMode] = useState(false);
  
  // Определяем, использовать ли мобильный режим
  const useMobileMode = forceMobileMode || isMobileDevice;
  
  // Синхронизация тумана войны для игрока
  // Всегда используем main-map для текущей активной карты сессии
  const mapId = 'main-map';
  useFogSync(sessionId, mapId);
  
  // Очищаем туман войны при смене карты
  useEffect(() => {
    console.log('🎮 [PLAYER] Session ID:', sessionId);
    console.log('🎮 [PLAYER] User ID:', user?.id);
    console.log('🗺️ [PLAYER] Map ID:', mapId);
    console.log('🗺️ [PLAYER] Map URL:', mapImageUrl);
  }, [sessionId, user, mapId, mapImageUrl]);

  // Найти токен игрока
  const playerToken = Array.isArray(tokens) ? tokens.find(t => t.owner_id === user?.id && !t.is_summoned) : undefined;
  
  // Все видимые токены (персонажи + призванные существа игрока)
  const visibleTokens = Array.isArray(tokens) ? tokens.filter(t => 
    t.isVisible && (!t.isEnemy || t.owner_id === user?.id)
  ) : [];

  const handleAvatarUpdate = (url: string) => {
    if (playerToken) {
      updateToken(playerToken.id, { avatarUrl: url, image_url: url });
    }
  };

  const handleAction = (actionType: string, data?: any) => {
    console.log('Player action:', actionType, data);
    // Здесь можно добавить логику отправки действий DM
  };

  // Если мобильный режим, используем специальный мобильный интерфейс
  if (useMobileMode) {
    return (
      <>
        {/* Кнопка переключения режима */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="default"
            size="sm"
            onClick={() => setForceMobileMode(!forceMobileMode)}
            className="bg-primary/90 backdrop-blur-sm shadow-lg gap-2"
          >
            <Monitor className="h-4 w-4" />
            Веб-версия
          </Button>
        </div>
        
        <PlayerBattleInterfaceMobile
          sessionId={sessionId}
          sessionCode={sessionCode}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex bg-background relative">
      {/* Кнопка переключения режима для десктопа */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setForceMobileMode(!forceMobileMode)}
          className="bg-background/95 backdrop-blur-sm shadow-lg gap-2"
        >
          <Smartphone className="h-4 w-4" />
          Мобильная версия
        </Button>
      </div>

      {/* Основной контент - full height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель - профиль и группа - скрыта на мобильных */}
        <div className="hidden lg:flex w-80 border-r border-border flex-col">
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
            <Button
              variant={showCombatLog ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCombatLog(!showCombatLog)}
              className="w-full"
            >
              {showCombatLog ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showCombatLog ? 'Скрыть лог' : 'Показать лог'}
            </Button>
          </div>
        </div>

        {/* Центр - карта */}
        <div className="flex-1 flex flex-col">
          {/* Карта - занимает весь экран на мобильных */}
          <div className="flex-1 relative">
            <BattleMap2DPlayer
              sessionId={sessionId}
              mapImageUrl={mapImageUrl}
              tokens={visibleTokens}
            />
          </div>

          {/* Нижняя панель - действия - скрыта на мобильных */}
          <div className="hidden lg:block border-t border-border flex-shrink-0">
            <PlayerActionsPanel
              token={playerToken}
              sessionId={sessionId}
              onAction={handleAction}
              onSummon={addToken}
            />
          </div>
        </div>

        {/* Правая панель - комбинированная - скрыта на мобильных */}
        <div className="hidden lg:flex w-80 border-l border-border flex-col">
          {/* Видеочат */}
          {showVideoChat && (
            <div className="h-64 border-b border-border flex-shrink-0">
              <VideoChatMini
                sessionId={sessionId}
                playerName={playerToken?.name || 'Игрок'}
                isDM={false}
              />
            </div>
          )}
          
          {/* Лог боя */}
          {showCombatLog && (
            <div className="flex-1 min-h-0">
              <CombatLogMini events={combatLog} />
            </div>
          )}
        </div>
      </div>

      {/* Мобильная нижняя панель действий */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <PlayerActionsPanel
          token={playerToken}
          sessionId={sessionId}
          onAction={handleAction}
          onSummon={addToken}
        />
      </div>
    </div>
  );
};
