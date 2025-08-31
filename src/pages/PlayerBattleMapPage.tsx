import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import SessionChat from '@/components/session/SessionChat';
import { SessionAudioPlayer } from '@/components/session/SessionAudioPlayer';
import BattleMap2DPlayer from '@/components/battle/BattleMap2DPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Map } from 'lucide-react';

const PlayerBattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessionState, loading } = useSessionSync(sessionId || 'default-session');
  const { tokens, mapImageUrl, setMapImageUrl } = useEnhancedBattleStore();

  // Синхронизируем URL карты с состоянием сессии
  useEffect(() => {
    if (sessionState?.current_map_url && sessionState.current_map_url !== mapImageUrl) {
      setMapImageUrl(sessionState.current_map_url);
    }
  }, [sessionState?.current_map_url, mapImageUrl, setMapImageUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Заголовок */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6" />
              Боевая карта
            </h1>
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Сессия: {sessionId}
            </Badge>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex">
        {/* Боевая карта */}
        <div className="flex-1 relative">
          <BattleMap2DPlayer 
            sessionId={sessionId || 'default-session'}
            mapImageUrl={mapImageUrl}
            tokens={tokens}
          />
        </div>

        {/* Боковая панель с чатом */}
        <div className="w-80 border-l border-border flex flex-col">
          <div className="flex-1">
            <SessionChat sessionId={sessionId || 'default-session'} />
          </div>
          
          {/* Аудио плеер */}
          <div className="p-4 border-t border-border">
            <SessionAudioPlayer 
              sessionId={sessionId || 'default-session'} 
              isDM={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBattleMapPage;