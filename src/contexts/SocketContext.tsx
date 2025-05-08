
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService, useSocket as useSocketStore } from '@/services/socket';
import { TokenData } from '@/types/session.types';

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  lastUpdate: Date | null;
  connect: (sessionCode: string, playerName?: string, characterId?: string) => void;
  disconnect: () => void;
  sendChatMessage: (message: { message: string, roomCode: string, nickname: string }) => void;
  sendRoll: (rollRequest: { formula: string, reason?: string }) => void;
  sendUpdate: (data: any) => void;
  updateToken: (token: TokenData) => void;
  sessionData: { code: string; name?: string } | null;
}

// Create and export the SocketContext - this must be exported
export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionData, setSessionData] = useState<{ code: string; name?: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
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
      setLastUpdate(new Date());
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setSessionData(null);
      setLastUpdate(new Date());
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
    setLastUpdate(new Date());
  };

  // Отключение от сессии
  const disconnect = () => {
    console.log('Disconnecting from session');
    disconnectSocket();
    setSessionData(null);
    setLastUpdate(new Date());
  };

  // Отправка обновления персонажа
  const sendUpdate = (data: any) => {
    const payload = {
      type: 'update',
      data
    };
    
    console.log('Sending update:', payload);
    setLastUpdate(new Date());
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketService, // Add the actual socket object
        isConnected,
        lastUpdate,
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

// Export a hook that uses the context - this is how components will use it
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
