
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SocketContextProps {
  sendUpdate: ((data: any) => void) | null;
  isConnected: boolean;
  connectionError: string | null;
}

const defaultSocketContext: SocketContextProps = {
  sendUpdate: null,
  isConnected: false,
  connectionError: null
};

const SocketContext = createContext<SocketContextProps>(defaultSocketContext);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Функция-заглушка для отправки данных
  const sendUpdate = (data: any) => {
    console.log('Отправка данных через сокет:', data);
    // В реальном приложении здесь будет реализована настоящая отправка через сокет
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
    <SocketContext.Provider value={{ sendUpdate, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
