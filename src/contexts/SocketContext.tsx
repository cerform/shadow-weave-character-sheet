
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { realtimeManager } from '@/services/RealtimeService';

interface SocketContextProps {
  sendUpdate: ((data: any) => void) | null;
  isConnected: boolean;
  connectionError: string | null;
  socket: any | null;
  connect: (sessionId: string, playerName?: string, characterId?: string) => void; // Обновляем сигнатуру с опциональными параметрами
  sessionData: any | null;
  connected: boolean;
  lastUpdate: { character?: any; music?: any; timestamp?: Date } | null; // Включаем данные о персонаже и музыке
}

const defaultSocketContext: SocketContextProps = {
  sendUpdate: null,
  isConnected: false,
  connectionError: null,
  socket: null,
  connect: () => {}, // Заглушка функции
  sessionData: null,
  connected: false,
  lastUpdate: null
};

const SocketContext = createContext<SocketContextProps>(defaultSocketContext);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any | null>(null);
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<{ character?: any; music?: any; timestamp?: Date } | null>(null);
  const { toast } = useToast();

  // Реальная функция для отправки данных через Supabase Realtime
  const sendUpdate = async (data: any) => {
    if (!sessionData?.id) {
      console.warn('Нет активной сессии для отправки данных');
      return;
    }

    try {
      console.log('📡 Отправка данных через Supabase:', data);
      
      const result = await realtimeManager.sendBroadcast(sessionData.id, 'session_update', {
        ...data,
        timestamp: new Date().toISOString(),
        sessionId: sessionData.id
      });

      if (result === 'ok') {
        setLastUpdate({ ...data, timestamp: new Date() });
        console.log('✅ Данные успешно отправлены');
      } else {
        throw new Error('Ошибка отправки данных');
      }
    } catch (error) {
      console.error('❌ Ошибка отправки данных:', error);
      setConnectionError('Ошибка синхронизации данных');
      toast({
        title: "Ошибка синхронизации",
        description: "Не удалось отправить данные другим участникам",
        variant: "destructive"
      });
    }
  };

  // Функция подключения к сессии с реальным Supabase каналом
  const connect = async (sessionId: string, playerName?: string, characterId?: string) => {
    try {
      console.log(`🔌 Подключение к сессии: ${sessionId}`);
      setConnectionError(null);

      const user = (await supabase.auth.getUser()).data.user;

      // Создаем канал для сессии
      const channel = await realtimeManager.connectSession(sessionId, user?.id, playerName, characterId);

      // Подписываемся на обновления состояния сессии
      realtimeManager.onBroadcast(sessionId, 'session_update', (payload) => {
        console.log('📨 Получено обновление сессии:', payload);
        setLastUpdate({
          ...payload.payload,
          timestamp: new Date(payload.payload.timestamp)
        });
      });

      realtimeManager.onPresence(sessionId, 'sync', (state) => {
        console.log('👥 Обновление участников:', state);
      });

      realtimeManager.onPresence(sessionId, 'join', ({ key, newPresences }) => {
        console.log('👋 Пользователь присоединился:', key, newPresences);
      });

      realtimeManager.onPresence(sessionId, 'leave', ({ key, leftPresences }) => {
        console.log('👋 Пользователь покинул сессию:', key, leftPresences);
      });

      setIsConnected(true);
      setConnected(true);
      setSocket(channel);
      setSessionData({ 
        id: sessionId, 
        name: `Сессия ${sessionId}`,
        playerName,
        characterId,
        channel
      });

      toast({
        title: "Подключение установлено",
        description: "Вы подключены к сессии",
      });

    } catch (error) {
      console.error('❌ Ошибка подключения к сессии:', error);
      setConnectionError('Не удалось подключиться к сессии');
      setIsConnected(false);
      setConnected(false);
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к сессии",
        variant: "destructive"
      });
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (sessionData?.id) {
        console.log('🔌 Отключение от канала сессии');
        // We don't strictly call removeChannel here because VTT might still be using it.
        // It's safer to rely on garbage collection or explicit disconnects when leaving the VTT page.
      }
    };
  }, [sessionData]);

  return (
    <SocketContext.Provider 
      value={{ 
        sendUpdate, 
        isConnected, 
        connectionError, 
        socket, 
        connect, 
        sessionData, 
        connected, 
        lastUpdate 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
