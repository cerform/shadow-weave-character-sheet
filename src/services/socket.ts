
import io, { Socket } from 'socket.io-client';

// Определение типов для результатов бросков кубиков
export interface DiceResult {
  nickname: string;
  userId?: string;
  diceType: string;
  result: number;
  timestamp?: number;
}

// Определение типов для сообщений чата
export interface ChatMessage {
  roomCode: string;
  userId?: string;
  username?: string;
  message: string;
  timestamp?: number;
}

// Определение API сервера
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Создание экземпляра Socket.io с автоподключением: false
export const socket: Socket = io(SERVER_URL, {
  autoConnect: false, // Важно: отключаем автоподключение
  reconnection: false, // Отключаем автоматические попытки переподключения
  timeout: 5000, // Уменьшаем таймаут для быстрого определения неудачных подключений
});

// Сервис для работы с сокетами
export const socketService = {
  connect: (sessionCode: string, playerName: string, characterId?: string) => {
    // Проверяем, что сокет не подключен, прежде чем пытаться подключиться
    if (!socket.connected) {
      try {
        socket.connect();
        socket.emit('joinRoom', { roomCode: sessionCode, nickname: playerName, characterId });
        return true;
      } catch (error) {
        console.error("Ошибка подключения сокета:", error);
        return false;
      }
    }
    return false;
  },

  disconnect: () => {
    // Проверяем, что сокет подключен, прежде чем пытаться отключиться
    if (socket.connected) {
      socket.disconnect();
    }
  },

  sendChatMessage: (message: string) => {
    if (socket.connected) {
      socket.emit('chatMessage', { message });
    } else {
      console.warn("Нельзя отправить сообщение: сокет не подключен");
    }
  },

  sendRoll: (formula: string, reason?: string) => {
    if (socket.connected) {
      socket.emit('rollDice', { formula, reason });
    } else {
      console.warn("Нельзя отправить бросок: сокет не подключен");
    }
  },

  updateToken: (token: any) => {
    if (socket.connected) {
      socket.emit('updateToken', token);
    } else {
      console.warn("Нельзя обновить токен: сокет не подключен");
    }
  },
  
  on: (event: string, callback: (...args: any[]) => void) => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  },
  
  off: (event: string, callback?: (...args: any[]) => void) => {
    socket.off(event, callback);
  },
};

export default socketService;
