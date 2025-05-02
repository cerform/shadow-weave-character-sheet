
import { io, Socket } from 'socket.io-client';
import { ChatMessage, SessionData, Token, InitiativeOrder } from '@/types/socket';

// Экспортируем типы для использования в компонентах
export type { ChatMessage, SessionData, Token, InitiativeOrder };
export interface DiceResult {
  nickname: string;
  diceType: string;
  result: number;
}

// Define the server URL - default to localhost in development
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-server.com'
  : 'http://localhost:3001';

// Создаем экземпляр сокета
export const socket = io(SERVER_URL, {
  autoConnect: false
});

class SocketIOService {
  private socketInstance: Socket | null = null;
  private listeners: { [key: string]: Function[] } = {};

  // Initialize the socket connection
  connect(sessionCode: string, playerName: string, characterId?: string) {
    if (this.socketInstance) {
      this.disconnect();
    }

    this.socketInstance = io(SERVER_URL, {
      query: {
        sessionCode,
        playerName,
        characterId
      }
    });

    this.setupListeners();
    return this.socketInstance;
  }

  // Disconnect the socket
  disconnect() {
    if (this.socketInstance) {
      this.socketInstance.disconnect();
      this.socketInstance = null;
      this.listeners = {};
    }
  }

  // Setup default listeners
  private setupListeners() {
    if (!this.socketInstance) return;

    this.socketInstance.on('connect', () => {
      this.emit('connection_established');
    });

    this.socketInstance.on('disconnect', () => {
      this.emit('connection_lost');
    });

    this.socketInstance.on('error', (error) => {
      this.emit('socket_error', error);
    });

    // Session specific events
    this.socketInstance.on('session_update', (data: SessionData) => {
      this.emit('session_update', data);
    });

    this.socketInstance.on('chat_message', (message: ChatMessage) => {
      this.emit('chat_message', message);
    });

    this.socketInstance.on('token_update', (token: Token) => {
      this.emit('token_update', token);
    });

    this.socketInstance.on('initiative_update', (initiative: InitiativeOrder[]) => {
      this.emit('initiative_update', initiative);
    });
  }

  // Send chat message
  sendChatMessage(message: string) {
    if (!this.socketInstance) return;
    this.socketInstance.emit('chat_message', { message });
  }

  // Send dice roll
  sendRoll(formula: string, reason?: string) {
    if (!this.socketInstance) return;
    this.socketInstance.emit('roll_dice', { formula, reason });
  }

  // Update token position or attributes
  updateToken(token: Partial<Token> & { id: string }) {
    if (!this.socketInstance) return;
    this.socketInstance.emit('update_token', token);
  }

  // Add listener for events
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  // Remove listener
  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit event to listeners
  private emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(...args));
  }

  // Check if connected
  isConnected() {
    return this.socketInstance?.connected || false;
  }

  // Get socket id
  getSocketId() {
    return this.socketInstance?.id;
  }
}

// Export singleton instance
export const socketService = new SocketIOService();
