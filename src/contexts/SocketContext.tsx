
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SocketContextProps {
  sendUpdate: ((data: any) => void) | null;
  isConnected: boolean;
  connectionError: string | null;
  socket: any | null;
  connect: (sessionId: string, playerName?: string, characterId?: string) => void; // Обновляем сигнатуру с опциональными параметрами
  sessionData: any | null;
  connected: boolean;
  lastUpdate: { character?: any; timestamp?: Date } | null; // Меняем тип lastUpdate, чтобы включить данные о персонаже
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
  const [lastUpdate, setLastUpdate] = useState<{ character?: any; timestamp?: Date } | null>(null);

  // Функция-заглушка для отправки данных
  const sendUpdate = (data: any) => {
    console.log('Отправка данных через сокет:', data);
    // В реальном приложении здесь будет реализована настоящая отправка через сокет
    setLastUpdate({ character: data, timestamp: new Date() });
  };

  // Функция подключения к сессии с дополнительными параметрами
  const connect = (sessionId: string, playerName?: string, characterId?: string) => {
    console.log(`Подключение к сессии: ${sessionId}, игрок: ${playerName || 'не указан'}, персонаж: ${characterId || 'не указан'}`);
    // Здесь будет код реального подключения к сессии
    setConnected(true);
    setIsConnected(true);
    setSessionData({ 
      id: sessionId, 
      name: `Сессия ${sessionId}`,
      playerName,
      characterId
    });
  };

  // Эффект для инициализации соединения при монтировании компонента
  useEffect(() => {
    console.log('SocketProvider: Инициализация');
    
    // Здесь будет код для инициализации WebSocket соединения
    
    return () => {
      console.log('SocketProvider: Отключение');
      // Закрытие соединения при размонтировании компонента
    };
  }, []);

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
