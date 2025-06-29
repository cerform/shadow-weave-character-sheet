
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
  private connectionAttempts = 0;
  private maxRetries = 5;

  connect(url: string = 'http://localhost:3001') {
    if (this.socket?.connected) {
      console.log('WebSocket уже подключен');
      return;
    }

    console.log('Подключение к WebSocket серверу:', url);
    
    this.socket = io(url, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxRetries,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Подключен к WebSocket серверу');
      this.connectionAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Отключен от WebSocket сервера:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Ошибка подключения к WebSocket:', error);
      this.connectionAttempts++;
      
      if (this.connectionAttempts >= this.maxRetries) {
        console.error('Превышено максимальное количество попыток подключения');
      }
    });

    this.socket.on('chatMessage', (data) => {
      console.log('Получено сообщение чата:', data);
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
      console.log('Получен результат броска:', data);
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
      console.log('Обновление игроков:', players);
      this.playerUpdateCallbacks.forEach(callback => callback(players));
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Отключение от WebSocket сервера');
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
    }
  }

  createRoom(nickname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('Нет соединения с сервером');
        return;
      }

      console.log('Создание комнаты для:', nickname);
      this.socket.emit('createRoom', nickname, (response: { roomCode: string }) => {
        this.currentRoom = response.roomCode;
        console.log('✅ Комната создана:', response.roomCode);
        resolve(response.roomCode);
      });
    });
  }

  joinRoom(roomCode: string, nickname: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('Нет соединения с сервером');
        return;
      }

      console.log('Присоединение к комнате:', roomCode, 'как:', nickname);
      this.socket.emit('joinRoom', { roomCode, nickname }, (response: { success: boolean; message?: string }) => {
        if (response.success) {
          this.currentRoom = roomCode;
          console.log('✅ Успешно присоединился к комнате:', roomCode);
          resolve(true);
        } else {
          console.error('❌ Не удалось присоединиться к комнате:', response.message);
          reject(response.message || 'Не удалось присоединиться к комнате');
        }
      });
    });
  }

  sendMessage(message: string, nickname: string) {
    if (this.socket && this.socket.connected && this.currentRoom) {
      console.log('Отправка сообщения:', message, 'от:', nickname);
      this.socket.emit('chatMessage', {
        roomCode: this.currentRoom,
        nickname,
        message
      });
    } else {
      console.warn('Не удается отправить сообщение: нет соединения или комнаты');
    }
  }

  rollDice(diceType: string, nickname: string) {
    if (this.socket && this.socket.connected && this.currentRoom) {
      console.log('Бросок кубика:', diceType, 'от:', nickname);
      this.socket.emit('rollDice', {
        roomCode: this.currentRoom,
        nickname,
        diceType
      });
    } else {
      console.warn('Не удается выполнить бросок: нет соединения или комнаты');
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

  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }
}

export const websocketService = new WebSocketService();
