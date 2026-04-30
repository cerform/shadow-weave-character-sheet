import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { realtimeManager } from '@/services/RealtimeService';

interface PlayerPresence {
  userId: string;
  userName: string;
  character?: string;
  online: boolean;
  lastSeen: string;
}

interface PlayersListProps {
  sessionId: string;
  isDM?: boolean;
}

export const PlayersList: React.FC<PlayersListProps> = ({ sessionId, isDM = false }) => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());

  // Загрузка игроков из базы
  useEffect(() => {
    if (!sessionId) return;

    const loadPlayers = async () => {
      const { data, error } = await supabase
        .from('session_players')
        .select('id, user_id, player_name, character_id, is_online, last_seen')
        .eq('session_id', sessionId);

      if (error) {
        console.error('Ошибка загрузки игроков:', error);
        return;
      }

      if (data) {
        setPlayers(data.map(p => ({
          userId: p.user_id,
          userName: p.player_name || 'Игрок',
          character: typeof p.character_id === 'string' ? p.character_id : undefined,
          online: p.is_online || false,
          lastSeen: p.last_seen || new Date().toISOString()
        })));
      }
    };

    loadPlayers();
  }, [sessionId]);

  // Real-time отслеживание присутствия игроков
  useEffect(() => {
    if (!sessionId || !user) return;

    realtimeManager.connectSession(sessionId, user?.id, user?.user_metadata?.full_name || 'Пользователь').catch(console.error);

    const unsubSync = realtimeManager.onPresence(sessionId, 'sync', (state) => {
      const onlineUserIds = new Set<string>();
      
      Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: any) => {
          if (presence.userId || presence.user_id) { // fallback to user_id just in case
            onlineUserIds.add(presence.userId || presence.user_id);
          }
        });
      });
      
      setOnlinePlayers(onlineUserIds);
    });

    const unsubJoin = realtimeManager.onPresence(sessionId, 'join', ({ newPresences }) => {
      console.log('Игрок присоединился:', newPresences);
    });

    const unsubLeave = realtimeManager.onPresence(sessionId, 'leave', ({ leftPresences }) => {
      console.log('Игрок покинул сессию:', leftPresences);
    });

    // Подписка на изменения в таблице session_players для обновления списка
    const unsubPlayers = realtimeManager.onPgChange(sessionId, 'session_players', '*', (payload) => {
      console.log('Изменение в session_players:', payload);
      // Перезагружаем список игроков
      const loadPlayers = async () => {
        const { data } = await supabase
          .from('session_players')
          .select('id, user_id, player_name, character_id, is_online, last_seen')
          .eq('session_id', sessionId);

        if (data) {
          setPlayers(data.map(p => ({
            userId: p.user_id,
            userName: p.player_name || 'Игрок',
            character: typeof p.character_id === 'string' ? p.character_id : undefined,
            online: p.is_online || false,
            lastSeen: p.last_seen || new Date().toISOString()
          })));
        }
      };
      loadPlayers();
    });

    return () => {
      unsubSync();
      unsubJoin();
      unsubLeave();
      unsubPlayers();
    };
  }, [sessionId, user, isDM]);

  const onlineCount = onlinePlayers.size;
  const totalCount = players.length;

  return (
    <div className="border-b border-border">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            <span>Игроки</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {onlineCount}/{totalCount}
          </Badge>
        </div>
        
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {players.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                Нет подключенных игроков
              </div>
            ) : (
              players.map((player) => {
                const isOnline = onlinePlayers.has(player.userId);
                return (
                  <div
                    key={player.userId}
                    className="flex items-center gap-2 p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Circle
                      className={`h-2 w-2 flex-shrink-0 ${
                        isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {String(player.userName || 'Игрок')}
                      </div>
                      {player.character && typeof player.character === 'string' && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {String(player.character)}
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Online
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
