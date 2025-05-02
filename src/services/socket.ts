
import { io, Socket } from 'socket.io-client';
import { ChatMessage, SessionData, Token, InitiativeOrder } from '@/types/socket';

// Define the server URL - default to localhost in development
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-server.com'
  : 'http://localhost:3001';

class SocketIOService {
  private socket: Socket | null = null;
  private listeners: { [key: string]: Function[] } = {};

  // Initialize the socket connection
  connect(sessionCode: string, playerName: string, characterId?: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SERVER_URL, {
      query: {
        sessionCode,
        playerName,
        characterId
      }
    });

    this.setupListeners();
    return this.socket;
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners = {};
    }
  }

  // Setup default listeners
  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.emit('connection_established');
    });

    this.socket.on('disconnect', () => {
      this.emit('connection_lost');
    });

    this.socket.on('error', (error) => {
      this.emit('socket_error', error);
    });

    // Session specific events
    this.socket.on('session_update', (data: SessionData) => {
      this.emit('session_update', data);
    });

    this.socket.on('chat_message', (message: ChatMessage) => {
      this.emit('chat_message', message);
    });

    this.socket.on('token_update', (token: Token) => {
      this.emit('token_update', token);
    });

    this.socket.on('initiative_update', (initiative: InitiativeOrder[]) => {
      this.emit('initiative_update', initiative);
    });
  }

  // Send chat message
  sendChatMessage(message: string) {
    if (!this.socket) return;
    this.socket.emit('chat_message', { message });
  }

  // Send dice roll
  sendRoll(formula: string, reason?: string) {
    if (!this.socket) return;
    this.socket.emit('roll_dice', { formula, reason });
  }

  // Update token position or attributes
  updateToken(token: Partial<Token> & { id: string }) {
    if (!this.socket) return;
    this.socket.emit('update_token', token);
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
    return this.socket?.connected || false;
  }

  // Get socket id
  getSocketId() {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketService = new SocketIOService();
