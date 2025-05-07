
import { io, Socket } from 'socket.io-client';

// URI сервера - обычно нужно бы вынести в .env файл
const SERVER_URI = 'http://localhost:3001';

interface SocketService {
  socket: Socket | null;
  connect: (roomCode: string, nickname: string) => Socket;
  disconnect: () => void;
  joinRoom: (roomCode: string, nickname: string) => Promise<boolean>;
  createRoom: (nickname: string) => Promise<{ roomCode: string }>;
  sendMessage: (roomCode: string, nickname: string, message: string) => void;
  rollDice: (roomCode: string, nickname: string, diceType: string) => void;
}

class SessionSocketService implements SocketService {
  socket: Socket | null = null;

  connect(roomCode: string, nickname: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SERVER_URI);
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomCode: string, nickname: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.socket = this.connect(roomCode, nickname);
      }

      this.socket.emit('joinRoom', { roomCode, nickname }, (response: { success: boolean, message?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.message || 'Failed to join room'));
        }
      });
    });
  }

  createRoom(nickname: string): Promise<{ roomCode: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.socket = io(SERVER_URI);
      }

      this.socket.emit('createRoom', nickname, (response: { roomCode: string }) => {
        if (response && response.roomCode) {
          resolve(response);
        } else {
          reject(new Error('Failed to create room'));
        }
      });
    });
  }

  sendMessage(roomCode: string, nickname: string, message: string): void {
    if (!this.socket) return;

    this.socket.emit('chatMessage', {
      roomCode,
      nickname,
      message
    });
  }

  rollDice(roomCode: string, nickname: string, diceType: string): void {
    if (!this.socket) return;

    this.socket.emit('rollDice', {
      roomCode,
      nickname,
      diceType
    });
  }
}

export const socketService = new SessionSocketService();
