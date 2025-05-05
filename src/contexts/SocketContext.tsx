
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
  
  // Отключаем автоматическое подключение WebSocket
  useEffect(() => {
    // Отключаем сокет при монтировании, чтобы избежать постоянных попыток подключения
    if (socket.connected) {
      socket.disconnect();
    }
    
    // Очистка при размонтировании
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);
  
  // Реализуем локальную мок-версию соединения
  const connect = (sessionCode: string, playerName: string, characterId?: string) => {
    console.log(`Connecting to mock session ${sessionCode} as ${playerName} with character ${characterId}`);
    
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
      console.error("Ошибка подключения:", error);
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к сессии",
        variant: "destructive"
      });
    }
  };
  
  const disconnect = () => {
    console.log('Disconnecting from mock session');
    setConnected(false);
    setSessionData(null);
    
    toast({
      title: "Отключено от сессии",
      description: "Вы отключились от сессии"
    });
  };
  
  const sendUpdate = (character: Character) => {
    console.log('Sending character update (mock):', character);
    setLastUpdate({ character, timestamp: new Date().toISOString() });
  };
  
  const sendMessage = (message: string) => {
    console.log('Sending message (mock):', message);
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
