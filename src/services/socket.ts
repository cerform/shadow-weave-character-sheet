
// Обертка над Socket.IO для работы с сессиями D&D

import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { TokenData } from '@/types/session.types';

class SocketService {
  private socket: Socket | null = null;
  private sessionCode: string | null = null;
  private playerName: string | null = null;
  private characterId: string | null = null;
  private eventHandlers: Record<string, Function[]> = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Инициализация пустого сервиса
    this.eventHandlers = {
      'connected': [],
      'disconnected': [],
      'chat-message': [],
      'dice-roll': [],
      'token-update': [],
      'player-join': [],
      'player-leave': [],
      'session-update': [],
      'error': []
    };
  }

  // Получить информацию о текущем соединении
  getConnectionInfo() {
    return {
      isConnected: this.socket?.connected || false,
      sessionCode: this.sessionCode,
      playerName: this.playerName,
      characterId: this.characterId
    };
  }

  // Подключиться к серверу WebSocket
  connect(sessionCode: string, playerName: string = 'Player', characterId?: string) {
    // Проверяем, не подключены ли мы уже к той же сессии
    if (this.socket && this.socket.connected && this.sessionCode === sessionCode) {
      console.log('Уже подключены к сессии:', sessionCode);
      return;
    }
    
    // Отключаем существующее соединение, если оно есть
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Запоминаем данные для переподключения
    this.sessionCode = sessionCode;
    this.playerName = playerName;
    this.characterId = characterId || null;
    this.reconnectAttempts = 0;
    
    // Определяем URL сервера
    const serverUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3333';
    console.log(`Подключаемся к серверу: ${serverUrl}`);
    
    try {
      // Устанавливаем соединение
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        query: {
          sessionCode,
          playerName,
          characterId
        },
        autoConnect: true,
        reconnection: true
      });
      
      // Настраиваем обработчики событий
      this.socket.on('connect', () => {
        console.log(`Подключено к сессии: ${sessionCode}`);
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        // Уведомляем о подключении
        this.trigger('connected', { sessionCode, playerName, characterId });
        
        // Локальное логирование в консоль
        console.info(`Подключено к сессии: ${sessionCode}`);
      });
      
      this.socket.on('disconnect', () => {
        console.log('Отключено от сессии');
        this.trigger('disconnected');
        
        // Пытаемся переподключиться
        this.attemptReconnect();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Ошибка подключения:', error);
        this.trigger('error', { type: 'connect_error', message: error.message });
        
        // Пытаемся переподключиться при ошибке
        this.attemptReconnect();
      });
      
      // Обработчики сообщений от сервера
      this.socket.on('chat-message', (data) => {
        this.trigger('chat-message', data);
      });
      
      this.socket.on('dice-roll', (data) => {
        this.trigger('dice-roll', data);
      });
      
      this.socket.on('token-update', (data) => {
        this.trigger('token-update', data);
      });
      
      this.socket.on('player-join', (data) => {
        this.trigger('player-join', data);
        
        // Показываем уведомление
        toast.success(`${data.playerName} присоединился к сессии`);
      });
      
      this.socket.on('player-leave', (data) => {
        this.trigger('player-leave', data);
        
        // Показываем уведомление
        toast.error(`${data.playerName} покинул сессию`);
      });
      
      this.socket.on('session-update', (data) => {
        this.trigger('session-update', data);
      });
      
    } catch (error) {
      console.error('Ошибка при создании соединения WebSocket:', error);
      this.trigger('error', { type: 'initialization_error', message: 'Не удалось установить соединение с сервером' });
      
      // Также выводим в уведомление
      toast.error('Не удалось подключиться к серверу игровой сессии');
    }
  }

  // Попытка переподключения
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Максимальное количество попыток переподключения превышено');
      return;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectAttempts++;
    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Попытка переподключения ${this.reconnectAttempts} из ${this.maxReconnectAttempts} через ${timeout / 1000} сек...`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.sessionCode && this.playerName) {
        this.connect(this.sessionCode, this.playerName, this.characterId || undefined);
      }
    }, timeout);
  }

  // Отключиться от сервера
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionCode = null;
      this.playerName = null;
      this.characterId = null;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      console.log('Соединение закрыто');
    }
  }

  // Отправить сообщение в чат
  sendChatMessage(data: { message: string; roomCode: string; nickname: string }) {
    if (!this.socket || !this.socket.connected) {
      console.error('Невозможно отправить сообщение: нет соединения');
      toast.error('Невозможно отправить сообщение: потеряно соединение с сервером');
      return;
    }
    
    this.socket.emit('chat-message', data);
    console.log('Отправлено сообщение:', data.message);
  }

  // Отправить запрос на бросок кубиков
  sendRoll(data: { formula: string; reason?: string }) {
    if (!this.socket || !this.socket.connected) {
      console.error('Невозможно сделать бросок: нет соединения');
      return;
    }
    
    this.socket.emit('dice-roll', {
      ...data,
      playerName: this.playerName
    });
    
    console.log('Отправлен запрос на бросок:', data.formula);
  }

  // Отправить обновление токена
  updateToken(token: TokenData) {
    if (!this.socket || !this.socket.connected) {
      console.error('Невозможно обновить токен: нет соединения');
      return;
    }
    
    this.socket.emit('token-update', {
      token,
      sessionCode: this.sessionCode
    });
    
    console.log('Отправлено обновление токена:', token.id);
  }

  // Добавить обработчик события
  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    this.eventHandlers[event].push(callback);
    return this;
  }

  // Удалить обработчик события
  off(event: string, callback: Function) {
    if (!this.eventHandlers[event]) return this;
    
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      handler => handler !== callback
    );
    
    return this;
  }

  // Вызвать все обработчики для события
  private trigger(event: string, data?: any) {
    if (!this.eventHandlers[event]) return;
    
    this.eventHandlers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Ошибка в обработчике события ${event}:`, error);
      }
    });
  }
}

// Экспортируем синглтон
export const socketService = new SocketService();
