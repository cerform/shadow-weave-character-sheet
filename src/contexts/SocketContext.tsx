
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService, useSocket as useSocketStore } from '@/services/socket';
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
  const [sessionData, setSessionData] = useState<{ code: string; name?: string } | null>(null);
  
  // Используем новое zustand-хранилище
  const { isConnected, connect: connectSocket, disconnect: disconnectSocket, sendChatMessage, sendRoll, updateToken } = useSocketStore();

  useEffect(() => {
    // Попытка восстановления соединения при монтировании компонента
    const connectionInfo = socketService.getConnectionInfo();
    
    if (connectionInfo.sessionCode) {
      setSessionData({
        code: connectionInfo.sessionCode
      });
    }
    
    // Регистрируем обработчики
    const handleConnect = (data: any) => {
      console.log('Socket connected:', data);
      setSessionData({
        code: data.sessionCode,
        name: data.sessionName
      });
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
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
    connectSocket(sessionCode, playerName, characterId);
  };

  // Отключение от сессии
  const disconnect = () => {
    console.log('Disconnecting from session');
    disconnectSocket();
    setSessionData(null);
  };

  // Отправка обновления персонажа
  const sendUpdate = (data: any) => {
    const payload = {
      type: 'update',
      data
    };
    
    console.log('Sending update:', payload);
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
