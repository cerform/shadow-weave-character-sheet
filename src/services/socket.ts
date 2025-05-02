
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
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Сервис для работы с сокетами
export const socketService = {
  connect: (sessionCode: string, playerName: string, characterId?: string) => {
    socket.connect();
    socket.emit('joinRoom', { roomCode: sessionCode, nickname: playerName, characterId });
  },

  disconnect: () => {
    socket.disconnect();
  },

  sendChatMessage: (message: string) => {
    socket.emit('chatMessage', {
      message,
    });
  },

  sendRoll: (formula: string, reason?: string) => {
    socket.emit('rollDice', {
      formula,
      reason,
    });
  },

  updateToken: (token: any) => {
    socket.emit('updateToken', token);
  },
  
  on: (event: string, callback: (...args: any[]) => void) => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  },
};

export default socketService;
