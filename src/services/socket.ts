
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

// Определение API сервера с поддержкой резервного значения
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Определяем настройки для сокета
const socketOptions = {
  autoConnect: false,          // Отключаем автоподключение
  reconnection: true,          // Включаем переподключение
  reconnectionAttempts: 3,     // Ограничиваем количество попыток
  reconnectionDelay: 1000,     // Интервал между попытками (1 секунда)
  timeout: 5000,               // Таймаут подключения (5 секунд)
  transports: ['websocket', 'polling'], // Разрешаем WebSocket и polling
  secure: true                 // Используем защищенное соединение если доступно
};

// Создание экземпляра Socket.io с улучшенными настройками
export const socket: Socket = io(SERVER_URL, socketOptions);

// Регистрируем слушатели событий сокета
socket.on('connect', () => {
  console.log('[SOCKET] Соединение установлено, ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('[SOCKET] Ошибка соединения:', error);
});

socket.on('disconnect', (reason) => {
  console.log('[SOCKET] Соединение закрыто. Причина:', reason);
});

// Сервис для работы с сокетами с улучшенной обработкой ошибок
export const socketService = {
  connect: (sessionCode: string, playerName: string, characterId?: string) => {
    // Проверяем, что сокет не подключен, прежде чем пытаться подключиться
    if (!socket.connected) {
      try {
        console.log(`[SOCKET] Начало подключения к сессии ${sessionCode}`);
        
        // Регистрируем одноразовый обработчик успешного подключения
        const connectHandler = () => {
          console.log(`[SOCKET] Подключено к сессии ${sessionCode}`);
          socket.emit('joinRoom', { roomCode: sessionCode, nickname: playerName, characterId });
        };
        
        socket.once('connect', connectHandler);
        
        // Устанавливаем таймаут для соединения
        setTimeout(() => {
          socket.off('connect', connectHandler);
          if (!socket.connected) {
            console.error('[SOCKET] Таймаут подключения');
          }
        }, 5000); // 5-секундный таймаут
        
        socket.connect();
        return true;
      } catch (error) {
        console.error("[SOCKET] Ошибка при подключении сокета:", error);
        return false;
      }
    }
    return socket.connected; // Возвращаем текущее состояние соединения
  },

  disconnect: () => {
    // Проверяем, что сокет подключен, прежде чем пытаться отключиться
    if (socket.connected) {
      try {
        socket.disconnect();
        console.log('[SOCKET] Отключено');
        return true;
      } catch (error) {
        console.error('[SOCKET] Ошибка при отключении:', error);
        return false;
      }
    }
    return true;
  },

  sendChatMessage: (message: string) => {
    if (socket.connected) {
      socket.emit('chatMessage', { message });
      return true;
    } else {
      console.warn("[SOCKET] Нельзя отправить сообщение: сокет не подключен");
      return false;
    }
  },

  sendRoll: (formula: string, reason?: string) => {
    if (socket.connected) {
      socket.emit('rollDice', { formula, reason });
      return true;
    } else {
      console.warn("[SOCKET] Нельзя отправить бросок: сокет не подключен");
      return false;
    }
  },

  updateToken: (token: any) => {
    if (socket.connected) {
      socket.emit('updateToken', token);
      return true;
    } else {
      console.warn("[SOCKET] Нельзя обновить токен: сокет не подключен");
      return false;
    }
  },
  
  // Улучшенная проверка состояния соединения
  isConnected: () => {
    return socket && socket.connected;
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
