
import { io, Socket } from 'socket.io-client';
import { Character } from '@/types/character';

export interface SessionMessage {
  id: string;
  type: 'chat' | 'dice' | 'system' | 'character_update';
  sender: string;
  content: any;
  timestamp: string;
  sessionId: string;
}

export interface DiceRollResult {
  id: string;
  playerId: string;
  playerName: string;
  diceType: string;
  result: number;
  modifier: number;
  total: number;
  timestamp: string;
}

export interface SessionPlayer {
  id: string;
  name: string;
  character?: Character;
  isOnline: boolean;
  isDM: boolean;
}

export interface GameSession {
  id: string;
  name: string;
  code: string;
  dmId: string;
  players: SessionPlayer[];
  isActive: boolean;
  createdAt: string;
  battleMap?: {
    width: number;
    height: number;
    tokens: any[];
  };
}

class SocketService {
  private socket: Socket | null = null;
  private currentSession: GameSession | null = null;
  private messageCallbacks: ((message: SessionMessage) => void)[] = [];
  private diceCallbacks: ((roll: DiceRollResult) => void)[] = [];
  private sessionUpdateCallbacks: ((session: GameSession) => void)[] = [];
  private playerUpdateCallbacks: ((players: SessionPlayer[]) => void)[] = [];

  connect() {
    if (this.socket?.connected) return;

    console.log('🔌 Подключение к серверу...');
    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Подключен к серверу');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Отключен от сервера');
    });

    this.socket.on('session:created', (session: GameSession) => {
      console.log('🎯 Сессия создана:', session);
      this.currentSession = session;
      this.sessionUpdateCallbacks.forEach(callback => callback(session));
    });

    this.socket.on('session:joined', (data: { session: GameSession; player: SessionPlayer }) => {
      console.log('👥 Игрок присоединился:', data.player.name);
      this.currentSession = data.session;
      this.sessionUpdateCallbacks.forEach(callback => callback(data.session));
      this.playerUpdateCallbacks.forEach(callback => callback(data.session.players));
    });

    this.socket.on('session:message', (message: SessionMessage) => {
      console.log('💬 Получено сообщение:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('session:dice_roll', (roll: DiceRollResult) => {
      console.log('🎲 Результат броска:', roll);
      this.diceCallbacks.forEach(callback => callback(roll));
    });

    this.socket.on('session:player_update', (players: SessionPlayer[]) => {
      console.log('🔄 Обновление игроков:', players);
      if (this.currentSession) {
        this.currentSession.players = players;
        this.sessionUpdateCallbacks.forEach(callback => callback(this.currentSession!));
      }
      this.playerUpdateCallbacks.forEach(callback => callback(players));
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Ошибка сокета:', error);
    });
  }

  // DM методы
  createSession(name: string, dmName: string, character?: Character): Promise<GameSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Нет соединения с сервером'));
        return;
      }

      this.socket.emit('session:create', { name, dmName, character }, (response: any) => {
        if (response.success) {
          this.currentSession = response.session;
          resolve(response.session);
        } else {
          reject(new Error(response.error || 'Ошибка создания сессии'));
        }
      });
    });
  }

  // Player методы
  joinSession(code: string, playerName: string, character?: Character): Promise<GameSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Нет соединения с сервером'));
        return;
      }

      this.socket.emit('session:join', { code, playerName, character }, (response: any) => {
        if (response.success) {
          this.currentSession = response.session;
          resolve(response.session);
        } else {
          reject(new Error(response.error || 'Ошибка подключения к сессии'));
        }
      });
    });
  }

  // Общие методы
  sendMessage(content: string, type: 'chat' | 'system' = 'chat') {
    if (!this.socket?.connected || !this.currentSession) return;

    const message: Partial<SessionMessage> = {
      type,
      content,
      sessionId: this.currentSession.id,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('session:send_message', message);
  }

  rollDice(diceType: string, modifier: number = 0, reason?: string) {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('session:roll_dice', {
      sessionId: this.currentSession.id,
      diceType,
      modifier,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  updateCharacter(character: Character) {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('session:update_character', {
      sessionId: this.currentSession.id,
      character,
      timestamp: new Date().toISOString()
    });
  }

  endSession() {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('session:end', { sessionId: this.currentSession.id });
    this.currentSession = null;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentSession = null;
    }
  }

  // Подписки на события
  onMessage(callback: (message: SessionMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onDiceRoll(callback: (roll: DiceRollResult) => void) {
    this.diceCallbacks.push(callback);
  }

  onSessionUpdate(callback: (session: GameSession) => void) {
    this.sessionUpdateCallbacks.push(callback);
  }

  onPlayerUpdate(callback: (players: SessionPlayer[]) => void) {
    this.playerUpdateCallbacks.push(callback);
  }

  // Отписки
  removeMessageListener(callback: (message: SessionMessage) => void) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) this.messageCallbacks.splice(index, 1);
  }

  removeDiceListener(callback: (roll: DiceRollResult) => void) {
    const index = this.diceCallbacks.indexOf(callback);
    if (index > -1) this.diceCallbacks.splice(index, 1);
  }

  removeSessionUpdateListener(callback: (session: GameSession) => void) {
    const index = this.sessionUpdateCallbacks.indexOf(callback);
    if (index > -1) this.sessionUpdateCallbacks.splice(index, 1);
  }

  removePlayerUpdateListener(callback: (players: SessionPlayer[]) => void) {
    const index = this.playerUpdateCallbacks.indexOf(callback);
    if (index > -1) this.playerUpdateCallbacks.splice(index, 1);
  }

  // Геттеры
  getCurrentSession() {
    return this.currentSession;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
