
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Character } from '@/types/character';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  name: string;
  code: string;
  dm: string;
  players: string[];
}

interface SocketContextType {
  connected: boolean;
  lastUpdate?: any;
  connect: (sessionCode: string, playerName: string, characterId?: string) => void;
  disconnect: () => void;
  sendUpdate: (character: Character) => void;
  sendMessage: (message: string) => void;
  isConnected: boolean;
  sessionData: SessionData | null;
  socket: any;
}

const defaultContext: SocketContextType = {
  connected: false,
  connect: () => {},
  disconnect: () => {},
  sendUpdate: () => {},
  sendMessage: () => {},
  isConnected: false,
  sessionData: null,
  socket: null
};

const SocketContext = createContext<SocketContextType>(defaultContext);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const { toast } = useToast();
  
  // Предотвращаем автоматическое подключение WebSocket
  useEffect(() => {
    // Проверяем, активен ли сокет и отключаем его
    if (socket && socket.connected) {
      try {
        socket.disconnect();
        console.log('[SOCKET] Отключение неиспользуемых WebSocket соединений');
      } catch (err) {
        console.error('[SOCKET] Ошибка при отключении:', err);
      }
    }
    
    // Регистрируем обработчик ошибок для сокета
    if (socket) {
      socket.on('connect_error', (err: any) => {
        console.error('[SOCKET] Ошибка соединения:', err);
      });
      
      socket.on('error', (err: any) => {
        console.error('[SOCKET] Общая ошибка сокета:', err);
      });
    }
    
    // Очистка при размонтировании
    return () => {
      if (socket) {
        socket.off('connect_error');
        socket.off('error');
        
        if (socket.connected) {
          socket.disconnect();
        }
      }
    };
  }, []);
  
  // Реализуем локальную мок-версию соединения
  const connect = (sessionCode: string, playerName: string, characterId?: string) => {
    console.log(`[SOCKET] Подключение к мок-сессии ${sessionCode} как ${playerName} с персонажем ${characterId}`);
    
    try {
      // Используем локальную имитацию соединения вместо реального WebSocket
      setConnected(true);
      setSessionData({
        name: `Сессия ${sessionCode}`,
        code: sessionCode,
        dm: 'DM',
        players: [playerName]
      });
      
      toast({
        title: "Подключено к сессии",
        description: `Вы успешно подключились к сессии ${sessionCode}`,
      });
    } catch (error) {
      console.error("[SOCKET] Ошибка подключения:", error);
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к сессии",
        variant: "destructive"
      });
    }
  };
  
  const disconnect = () => {
    console.log('[SOCKET] Отключение от мок-сессии');
    setConnected(false);
    setSessionData(null);
    
    toast({
      title: "Отключено от сессии",
      description: "Вы отключились от сессии"
    });
  };
  
  const sendUpdate = (character: Character) => {
    console.log('[SOCKET] Отправка обновления персонажа (мок):', character);
    setLastUpdate({ character, timestamp: new Date().toISOString() });
  };
  
  const sendMessage = (message: string) => {
    console.log('[SOCKET] Отправка сообщения (мок):', message);
  };
  
  return (
    <SocketContext.Provider value={{
      connected,
      lastUpdate,
      connect,
      disconnect,
      sendUpdate,
      sendMessage,
      isConnected: connected,
      sessionData,
      socket
    }}>
      {children}
    </SocketContext.Provider>
  );
};
