
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Character } from '@/types/character';
import { socket } from '@/services/socket';

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
  socket: any; // Добавляем свойство socket
}

const defaultContext: SocketContextType = {
  connected: false,
  connect: () => {},
  disconnect: () => {},
  sendUpdate: () => {},
  sendMessage: () => {},
  isConnected: false,
  sessionData: null,
  socket: null // Инициализируем свойство
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
  
  // Mock socket connection for now
  const connect = (sessionCode: string, playerName: string, characterId?: string) => {
    console.log(`Connecting to session ${sessionCode} as ${playerName} with character ${characterId}`);
    setConnected(true);
    setSessionData({
      name: `Сессия ${sessionCode}`,
      code: sessionCode,
      dm: 'DM',
      players: [playerName]
    });
  };
  
  const disconnect = () => {
    console.log('Disconnecting from session');
    setConnected(false);
    setSessionData(null);
  };
  
  const sendUpdate = (character: Character) => {
    console.log('Sending character update:', character);
    // В реальном приложении здесь был бы код отправки через сокет
    setLastUpdate({ character, timestamp: new Date().toISOString() });
  };
  
  const sendMessage = (message: string) => {
    console.log('Sending message:', message);
    // В реальном приложении здесь был бы код отправки через сокет
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
      socket // Добавляем socket в контекст
    }}>
      {children}
    </SocketContext.Provider>
  );
};
