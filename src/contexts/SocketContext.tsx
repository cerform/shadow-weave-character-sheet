
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService } from '@/services/socket';
import { TokenData } from '@/types/session.types';

interface SocketContextType {
  isConnected: boolean;
  connect: (sessionCode: string, playerName?: string, characterId?: string) => void;
  disconnect: () => void;
  sendChatMessage: (message: { message: string, roomCode: string, nickname: string }) => void;
  sendRoll: (rollRequest: { formula: string, reason?: string }) => void;
  sendUpdate: (data: any) => void;
  updateToken: (token: TokenData) => void;
  sessionData: { code: string; name?: string } | null;
}

const defaultContextValue: SocketContextType = {
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  sendChatMessage: () => {},
  sendRoll: () => {},
  sendUpdate: () => {},
  updateToken: () => {},
  sessionData: null
};

const SocketContext = createContext<SocketContextType>(defaultContextValue);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<{ code: string; name?: string } | null>(null);

  useEffect(() => {
    // Попытка восстановления соединения при монтировании компонента
    const connectionInfo = socketService.getConnectionInfo();
    setIsConnected(connectionInfo.isConnected);
    
    if (connectionInfo.sessionCode) {
      setSessionData({
        code: connectionInfo.sessionCode
      });
    }
    
    // Регистрируем обработчики
    const handleConnect = (data: any) => {
      console.log('Socket connected:', data);
      setIsConnected(true);
      setSessionData({
        code: data.sessionCode,
        name: data.sessionName
      });
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setSessionData(null);
    };
    
    socketService.on('connected', handleConnect);
    socketService.on('disconnected', handleDisconnect);
    
    return () => {
      socketService.off('connected', handleConnect);
      socketService.off('disconnected', handleDisconnect);
    };
  }, []);

  // Подключение к сессии
  const connect = (sessionCode: string, playerName: string = 'Игрок', characterId?: string) => {
    console.log(`Connecting to session: ${sessionCode} as ${playerName}`);
    socketService.connect(sessionCode, playerName, characterId);
  };

  // Отключение от сессии
  const disconnect = () => {
    console.log('Disconnecting from session');
    socketService.disconnect();
    setIsConnected(false);
    setSessionData(null);
  };

  // Отправка сообщения в чат
  const sendChatMessage = (message: { message: string, roomCode: string, nickname: string }) => {
    socketService.sendChatMessage(message);
  };

  // Отправка запроса на бросок кубиков
  const sendRoll = (rollRequest: { formula: string, reason?: string }) => {
    socketService.sendRoll(rollRequest);
  };

  // Отправка обновления персонажа
  const sendUpdate = (data: any) => {
    const payload = {
      type: 'update',
      data
    };
    
    console.log('Sending update:', payload);
  };

  // Обновление токена на карте
  const updateToken = (token: TokenData) => {
    socketService.updateToken(token);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        sendChatMessage,
        sendRoll,
        sendUpdate,
        updateToken,
        sessionData
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
