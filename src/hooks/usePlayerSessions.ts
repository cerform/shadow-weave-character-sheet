import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface GameSession {
  id: string;
  name: string;
  description: string | null;
  session_code: string;
  dm_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_map_url: string | null;
  player_name?: string;
  character_id?: string;
  joined_at?: string;
  is_online?: boolean;
}

export const usePlayerSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка сессий игрока
  const fetchPlayerSessions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Загружаем сессии для игрока:', user.id);

      // Загружаем сессии где пользователь является участником
      const { data, error: fetchError } = await supabase
        .from('session_players')
        .select(`
          player_name,
          character_id,
          joined_at,
          is_online,
          session_id,
          game_sessions (
            id,
            name,
            description,
            session_code,
            dm_id,
            is_active,
            created_at,
            updated_at,
            current_map_url
          )
        `)
        .eq('user_id', user.id)
        .eq('game_sessions.is_active', true)
        .order('joined_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Ошибка загрузки сессий:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Преобразуем данные в удобный формат
      const formattedSessions = data
        ?.filter((item: any) => item.game_sessions)
        .map((item: any) => ({
          ...item.game_sessions,
          player_name: item.player_name,
          character_id: item.character_id,
          joined_at: item.joined_at,
          is_online: item.is_online,
        })) || [];

      console.log('✅ Загружено сессий:', formattedSessions.length);
      setSessions(formattedSessions);
      setError(null);
    } catch (err) {
      console.error('❌ Ошибка при загрузке сессий:', err);
      setError('Не удалось загрузить сессии');
    } finally {
      setLoading(false);
    }
  };

  // Подписка на real-time обновления
  useEffect(() => {
    if (!user?.id) return;

    fetchPlayerSessions();

    // Подписываемся на изменения в session_players
    const playersChannel = supabase
      .channel('player-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_players',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Обновление session_players:', payload);
          fetchPlayerSessions();
        }
      )
      .subscribe();

    // Подписываемся на изменения в game_sessions
    const sessionsChannel = supabase
      .channel('game-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
        },
        (payload) => {
          console.log('🔄 Обновление game_sessions:', payload);
          fetchPlayerSessions();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Отписка от real-time каналов сессий игрока');
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [user?.id]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchPlayerSessions,
  };
};
