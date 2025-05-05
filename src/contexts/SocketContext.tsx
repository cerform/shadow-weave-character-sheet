
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character } from '@/types/character';

interface SessionData {
  name: string;
  dm: string;
  code: string;
  players: any[];
}

interface SocketContextType {
  isConnected: boolean;
  sessionData: SessionData | null;
  connect: (sessionCode: string, playerName: string, characterId?: string) => void;
  disconnect: () => void;
  sendUpdate: (character: Character) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  sessionData: null,
  connect: () => {},
  disconnect: () => {},
  sendUpdate: () => {}
});

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  
  // Проверяем наличие сохраненной сессии при загрузке
  useEffect(() => {
    const savedSession = localStorage.getItem('active-session');
    if (savedSession) {
      try {
        const sessionInfo = JSON.parse(savedSession);
        setSessionData({
          name: sessionInfo.sessionName || "Сессия",
          dm: sessionInfo.dmName || "Мастер",
          code: sessionInfo.sessionCode || "",
          players: sessionInfo.players || []
        });
        setIsConnected(true);
      } catch (e) {
        console.error('Ошибка при загрузке данных сессии:', e);
      }
    }
  }, []);

  // Функция для подключения к сессии
  const connect = (sessionCode: string, playerName: string, characterId?: string) => {
    // В реальном приложении здесь была бы логика соединения с сервером
    console.log(`Подключение к сессии ${sessionCode} игрока ${playerName} с персонажем ${characterId}`);
    
    // Сохраняем информацию о сессии
    const sessionInfo = {
      sessionCode,
      playerName,
      characterId,
      sessionName: `Сессия ${sessionCode}`,
      dmName: "Мастер",
      players: [{ name: playerName, id: Date.now(), connected: true }]
    };
    
    localStorage.setItem('active-session', JSON.stringify(sessionInfo));
    
    // Обновляем состояние
    setSessionData({
      name: sessionInfo.sessionName,
      dm: sessionInfo.dmName,
      code: sessionCode,
      players: sessionInfo.players
    });
    setIsConnected(true);
  };

  // Функция для отключения от сессии
  const disconnect = () => {
    localStorage.removeItem('active-session');
    setIsConnected(false);
    setSessionData(null);
  };
  
  // Функция для отправки обновлений о персонаже
  const sendUpdate = (character: Character) => {
    if (!isConnected || !sessionData) return;
    
    console.log('Отправка обновления персонажа:', character.name);
    // В реальном приложении здесь была бы логика отправки данных на сервер
  };

  return (
    <SocketContext.Provider value={{ 
      isConnected, 
      sessionData, 
      connect, 
      disconnect,
      sendUpdate 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
