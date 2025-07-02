
import { io, Socket } from 'socket.io-client';
import { Character } from '@/types/character';

export interface SessionMessage {
  id: string;
  type: 'chat' | 'dice' | 'system' | 'character_update';
  sender: string;
  content: any;
  timestamp: string;
  sessionId: string;
  isDM?: boolean;
}

export interface DiceRollResult {
  id: string;
  playerId: string;
  playerName: string;
  diceType: string;
  result: number;
  rolls: number[];
  modifier: number;
  total: number;
  reason?: string;
  timestamp: string;
}

export interface SessionPlayer {
  id: string;
  name: string;
  character?: Character;
  isOnline: boolean;
  isDM: boolean;
  joinedAt: string;
}

export interface BattleToken {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
}

export interface InitiativeOrder {
  order: { name: string; initiative: number; id: string }[];
  currentTurn: number;
  round: number;
}

export interface GameSession {
  id: string;
  name: string;
  code: string;
  dmId: string;
  dmName: string;
  players: SessionPlayer[];
  isActive: boolean;
  createdAt: string;
  messages: SessionMessage[];
  diceRolls: DiceRollResult[];
  battleMap: {
    width: number;
    height: number;
    gridSize: number;
    tokens: BattleToken[];
    isActive: boolean;
  };
  initiative: InitiativeOrder;
  notes: any[];
  handouts: any[];
  endedAt?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentSession: GameSession | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Callbacks
  private messageCallbacks = new Set<(message: SessionMessage) => void>();
  private diceCallbacks = new Set<(roll: DiceRollResult) => void>();
  private sessionUpdateCallbacks = new Set<(session: GameSession) => void>();
  private playerUpdateCallbacks = new Set<(players: SessionPlayer[]) => void>();
  private battleCallbacks = new Set<(data: any) => void>();

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      console.log('🔌 Подключение к D&D серверу...');
      
      this.socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.setupEventListeners();

      this.socket.on('connect', () => {
        console.log('✅ Подключен к D&D серверу');
        this.reconnectAttempts = 0;
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Ошибка подключения:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          resolve(false);
        }
      });
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Основные события сессии
    this.socket.on('session:updated', (session: GameSession) => {
      console.log('🔄 Обновление сессии:', session.name);
      this.currentSession = session;
      this.sessionUpdateCallbacks.forEach(callback => callback(session));
    });

    this.socket.on('session:player_joined', (player: SessionPlayer) => {
      console.log('👋 Игрок присоединился:', player.name);
      if (this.currentSession) {
        this.playerUpdateCallbacks.forEach(callback => callback(this.currentSession!.players));
      }
    });

    this.socket.on('session:player_disconnected', (data: { playerId: string; playerName: string }) => {
      console.log('👋 Игрок отключился:', data.playerName);
      if (this.currentSession) {
        this.playerUpdateCallbacks.forEach(callback => callback(this.currentSession!.players));
      }
    });

    this.socket.on('session:message', (message: SessionMessage) => {
      console.log('💬 Получено сообщение:', message.sender, message.content);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('session:dice_roll', (roll: DiceRollResult) => {
      console.log('🎲 Результат броска:', roll.playerName, roll.diceType, roll.total);
      this.diceCallbacks.forEach(callback => callback(roll));
    });

    this.socket.on('session:character_updated', (data: { playerId: string; character: Character }) => {
      console.log('🧙 Персонаж обновлен:', data.playerId);
      if (this.currentSession) {
        const player = this.currentSession.players.find(p => p.id === data.playerId);
        if (player) {
          player.character = data.character;
          this.sessionUpdateCallbacks.forEach(callback => callback(this.currentSession!));
        }
      }
    });

    // События боевой карты
    this.socket.on('battle:token_added', (token: BattleToken) => {
      console.log('⚔️ Токен добавлен:', token.name);
      this.battleCallbacks.forEach(callback => callback({ type: 'token_add', token }));
    });

    this.socket.on('battle:token_moved', (data: { tokenId: string; x: number; y: number }) => {
      console.log('🏃 Токен перемещен:', data.tokenId);
      this.battleCallbacks.forEach(callback => callback({ type: 'token_move', ...data }));
    });

    // События инициативы
    this.socket.on('initiative:started', (initiative: InitiativeOrder) => {
      console.log('⚡ Инициатива запущена');
      if (this.currentSession) {
        this.currentSession.initiative = initiative;
        this.sessionUpdateCallbacks.forEach(callback => callback(this.currentSession!));
      }
    });

    this.socket.on('session:ended', (data: { reason: string }) => {
      console.log('🔚 Сессия завершена:', data.reason);
      this.currentSession = null;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Отключен от сервера');
    });

    // Ping-pong
    this.socket.on('pong', () => {
      console.log('🏓 Pong получен');
    });
  }

  // DM методы
  async createSession(name: string, dmName: string, character?: Character): Promise<GameSession> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Нет соединения с сервером'));
        return;
      }

      this.socket.emit('session:create', { name, dmName, character }, (response: any) => {
        if (response.success) {
          this.currentSession = response.session;
          console.log('🎯 Сессия создана:', response.session.name, response.session.code);
          resolve(response.session);
        } else {
          console.error('❌ Ошибка создания сессии:', response.error);
          reject(new Error(response.error || 'Ошибка создания сессии'));
        }
      });
    });
  }

  // Player методы
  async joinSession(code: string, playerName: string, character?: Character): Promise<GameSession> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Нет соединения с сервером'));
        return;
      }

      this.socket.emit('session:join', { code, playerName, character }, (response: any) => {
        if (response.success) {
          this.currentSession = response.session;
          console.log('👥 Присоединился к сессии:', response.session.name);
          resolve(response.session);
        } else {
          console.error('❌ Ошибка присоединения:', response.error);
          reject(new Error(response.error || 'Ошибка подключения к сессии'));
        }
      });
    });
  }

  // Общие методы коммуникации
  sendMessage(content: string, type: 'chat' | 'system' = 'chat') {
    if (!this.socket?.connected || !this.currentSession) {
      console.warn('⚠️ Нет соединения или сессии для отправки сообщения');
      return;
    }

    this.socket.emit('session:send_message', {
      type,
      content,
      timestamp: new Date().toISOString()
    });
  }

  rollDice(diceType: string, modifier: number = 0, reason?: string) {
    if (!this.socket?.connected || !this.currentSession) {
      console.warn('⚠️ Нет соединения или сессии для броска кубиков');
      return;
    }

    this.socket.emit('session:roll_dice', {
      diceType,
      modifier,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  updateCharacter(character: Character) {
    if (!this.socket?.connected || !this.currentSession) {
      console.warn('⚠️ Нет соединения или сессии для обновления персонажа');
      return;
    }

    this.socket.emit('session:update_character', {
      character,
      timestamp: new Date().toISOString()
    });
  }

  // Методы боевой карты
  addBattleToken(token: Omit<BattleToken, 'id'>) {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('battle:token_add', { token });
  }

  moveBattleToken(tokenId: string, x: number, y: number) {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('battle:token_move', { tokenId, x, y });
  }

  // Методы инициативы
  startInitiative(order: { name: string; initiative: number; id: string }[]) {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('initiative:start', { order });
  }

  endSession() {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('session:end');
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
    this.messageCallbacks.add(callback);
  }

  onDiceRoll(callback: (roll: DiceRollResult) => void) {
    this.diceCallbacks.add(callback);
  }

  onSessionUpdate(callback: (session: GameSession) => void) {
    this.sessionUpdateCallbacks.add(callback);
  }

  onPlayerUpdate(callback: (players: SessionPlayer[]) => void) {
    this.playerUpdateCallbacks.add(callback);
  }

  onBattleEvent(callback: (data: any) => void) {
    this.battleCallbacks.add(callback);
  }

  // Отписки
  removeMessageListener(callback: (message: SessionMessage) => void) {
    this.messageCallbacks.delete(callback);
  }

  removeDiceListener(callback: (roll: DiceRollResult) => void) {
    this.diceCallbacks.delete(callback);
  }

  removeSessionUpdateListener(callback: (session: GameSession) => void) {
    this.sessionUpdateCallbacks.delete(callback);
  }

  removePlayerUpdateListener(callback: (players: SessionPlayer[]) => void) {
    this.playerUpdateCallbacks.delete(callback);
  }

  removeBattleListener(callback: (data: any) => void) {
    this.battleCallbacks.delete(callback);
  }

  // Геттеры
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Утилиты
  startHeartbeat() {
    if (!this.socket) return;

    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000);
  }
}

export const socketService = new SocketService();
