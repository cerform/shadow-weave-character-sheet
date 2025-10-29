import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useBattleTokensSync } from '@/hooks/useBattleTokensSync';
import { useBattleMapSync } from '@/hooks/useBattleMapSync';
import { usePlayerTokenSync } from '@/hooks/usePlayerTokenSync';
import { PlayerBattleInterface } from '@/components/battle/player/PlayerBattleInterface';
import { supabase } from '@/integrations/supabase/client';

const PlayerBattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessionState, loading } = useSessionSync(sessionId || 'default-session');
  const [sessionCode, setSessionCode] = useState<string>('');
  
  // Синхронизируем токены и карту с Supabase
  useBattleTokensSync(sessionId || 'default-session');
  useBattleMapSync(sessionId || 'default-session', false);
  
  // Автоматически создаем токен игрока когда карта загружена
  usePlayerTokenSync(sessionId || 'default-session');

  // Получаем код сессии из game_sessions
  useEffect(() => {
    const fetchSessionCode = async () => {
      if (!sessionId) return;
      
      const { data } = await supabase
        .from('game_sessions')
        .select('session_code')
        .eq('id', sessionId)
        .single();
      
      if (data?.session_code) {
        setSessionCode(data.session_code);
      }
    };
    
    fetchSessionCode();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PlayerBattleInterface 
      sessionId={sessionId || 'default-session'}
      sessionCode={sessionCode}
    />
  );
};

export default PlayerBattleMapPage;