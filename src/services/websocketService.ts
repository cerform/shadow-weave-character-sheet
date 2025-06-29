
import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  id: string;
  type: 'chat' | 'dice' | 'character_update' | 'system';
  sender: string;
  content: any;
  timestamp: string;
}

export interface DiceRoll {
  type: string;
  result: number;
  modifier: number;
  total: number;
  playerName: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private messageCallbacks: ((message: SocketMessage) => void)[] = [];
  private diceCallbacks: ((roll: DiceRoll) => void)[] = [];
  private playerUpdateCallbacks: ((players: any[]) => void)[] = [];

  connect(url: string = 'http://localhost:4000') {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(url, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('chatMessage', (data) => {
      const message: SocketMessage = {
        id: Date.now().toString(),
        type: 'chat',
        sender: data.nickname,
        content: data.message,
        timestamp: new Date().toISOString()
      };
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('diceResult', (data) => {
      const roll: DiceRoll = {
        type: data.diceType,
        result: data.result,
        modifier: 0,
        total: data.result,
        playerName: data.nickname
      };
      this.diceCallbacks.forEach(callback => callback(roll));
    });

    this.socket.on('updatePlayers', (players) => {
      this.playerUpdateCallbacks.forEach(callback => callback(players));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
    }
  }

  createRoom(nickname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected to server');
        return;
      }

      this.socket.emit('createRoom', nickname, (response: { roomCode: string }) => {
        this.currentRoom = response.roomCode;
        resolve(response.roomCode);
      });
    });
  }

  joinRoom(roomCode: string, nickname: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected to server');
        return;
      }

      this.socket.emit('joinRoom', { roomCode, nickname }, (response: { success: boolean; message?: string }) => {
        if (response.success) {
          this.currentRoom = roomCode;
          resolve(true);
        } else {
          reject(response.message || 'Failed to join room');
        }
      });
    });
  }

  sendMessage(message: string, nickname: string) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('chatMessage', {
        roomCode: this.currentRoom,
        nickname,
        message
      });
    }
  }

  rollDice(diceType: string, nickname: string) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('rollDice', {
        roomCode: this.currentRoom,
        nickname,
        diceType
      });
    }
  }

  onMessage(callback: (message: SocketMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onDiceRoll(callback: (roll: DiceRoll) => void) {
    this.diceCallbacks.push(callback);
  }

  onPlayerUpdate(callback: (players: any[]) => void) {
    this.playerUpdateCallbacks.push(callback);
  }

  removeMessageListener(callback: (message: SocketMessage) => void) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  removeDiceListener(callback: (roll: DiceRoll) => void) {
    const index = this.diceCallbacks.indexOf(callback);
    if (index > -1) {
      this.diceCallbacks.splice(index, 1);
    }
  }

  removePlayerUpdateListener(callback: (players: any[]) => void) {
    const index = this.playerUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.playerUpdateCallbacks.splice(index, 1);
    }
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
