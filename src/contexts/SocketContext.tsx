
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character } from '@/types/character';

export interface SocketContextType {
  connected: boolean;
  sendUpdate: (character: Character) => void;
  lastUpdate: any;
}

const defaultContext: SocketContextType = {
  connected: false,
  sendUpdate: () => {},
  lastUpdate: null
};

const SocketContext = createContext<SocketContextType>(defaultContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  // Функция для отправки обновлений персонажа
  const sendUpdate = (character: Character) => {
    // В реальном приложении здесь была бы логика отправки через сокет
    console.log('Отправка обновления персонажа:', character);
    setLastUpdate({ character, timestamp: new Date().toISOString() });
  };

  // Эффект для эмуляции подключения к сокет-серверу
  useEffect(() => {
    console.log('Подключение к сокет-серверу...');
    
    // Эмулируем задержку подключения
    const timeout = setTimeout(() => {
      setConnected(true);
      console.log('Подключено к сокет-серверу!');
    }, 1000);
    
    return () => {
      clearTimeout(timeout);
      console.log('Отключение от сокет-сервера.');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connected, sendUpdate, lastUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => useContext(SocketContext);
