
import { useState, useEffect, useCallback } from 'react';
import { getDMSessions, getPlayerSessions } from '@/services/sessionService';
import { useAuth } from '@/hooks/use-auth';
import { GameSession } from '@/types/session.types';

export const useGameSessions = () => {
  const [dmSessions, setDmSessions] = useState<GameSession[]>([]);
  const [playerSessions, setPlayerSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const loadSessions = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Загружаем сессии DM
      const dmSessionsData = await getDMSessions();
      setDmSessions(dmSessionsData);

      // Загружаем сессии игрока
      const playerSessionsData = await getPlayerSessions();
      setPlayerSessions(playerSessionsData);
    } catch (err) {
      console.error('Ошибка при загрузке сессий:', err);
      setError('Не удалось загрузить игровые сессии');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    dmSessions,
    playerSessions,
    isLoading,
    error,
    refreshSessions: loadSessions,
  };
};
