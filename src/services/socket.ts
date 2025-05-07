
import { TokenData } from '@/types/session.types';

class SocketService {
  private socket: WebSocket | null = null;
  private callbacks: Record<string, Function[]> = {};
  private sessionCode: string | null = null;
  private playerName: string | null = null;
  private characterId: string | undefined;

  // Подключение к WebSocket серверу
  connect(sessionCode: string, playerName: string, characterId?: string): void {
    this.sessionCode = sessionCode;
    this.playerName = playerName;
    this.characterId = characterId;
    
    console.log(`Попытка подключения к сессии: ${sessionCode}`);
    
    // В реальном приложении здесь был бы WebSocket
    // Для демо просто имитируем успешное подключение
    setTimeout(() => {
      this.trigger('connected', { sessionCode, playerName });
      console.log(`Подключено к сессии: ${sessionCode}`);
    }, 500);
  }

  // Отключение от WebSocket сервера
  disconnect(): void {
    if (this.socket) {
      // this.socket.close();
      this.socket = null;
    }
    
    this.sessionCode = null;
    this.playerName = null;
    this.characterId = undefined;
    this.callbacks = {};
    
    console.log('Отключено от сессии');
  }

  // Отправка сообщения в чат
  sendChatMessage(message: { message: string, roomCode: string, nickname: string }): void {
    if (!this.sessionCode) {
      console.error('Не подключено к сессии');
      return;
    }
    
    const payload = {
      type: 'chat',
      data: {
        ...message,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }
    };
    
    // В реальном приложении здесь был бы this.socket.send(JSON.stringify(payload))
    console.log('Отправка сообщения:', payload);
    
    // Имитируем получение эхо
    setTimeout(() => {
      this.trigger('message', payload.data);
    }, 100);
  }

  // Отправка запроса на бросок кубиков
  sendRoll(rollRequest: { formula: string, reason?: string }): void {
    if (!this.sessionCode) {
      console.error('Не подключено к сессии');
      return;
    }
    
    const payload = {
      type: 'roll',
      data: {
        ...rollRequest,
        playerName: this.playerName,
        characterId: this.characterId,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }
    };
    
    // В реальном приложении здесь был бы this.socket.send(JSON.stringify(payload))
    console.log('Отправка запроса на бросок:', payload);
    
    // Имитируем результат броска
    setTimeout(() => {
      const rolls = [Math.ceil(Math.random() * 20)];
      const total = rolls[0] + (rollRequest.formula.includes('+') ? 
        Number(rollRequest.formula.split('+')[1].trim()) : 0);
        
      this.trigger('roll', {
        formula: rollRequest.formula,
        rolls,
        total,
        reason: rollRequest.reason,
        playerName: this.playerName,
        characterId: this.characterId,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
    }, 500);
  }

  // Обновление токена на карте
  updateToken(token: TokenData): void {
    if (!this.sessionCode) {
      console.error('Не подключено к сессии');
      return;
    }
    
    const payload = {
      type: 'token-update',
      data: token
    };
    
    // В реальном приложении здесь был бы this.socket.send(JSON.stringify(payload))
    console.log('Обновление токена:', payload);
    
    // Имитируем получение обновления
    setTimeout(() => {
      this.trigger('token-update', token);
    }, 100);
  }

  // Регистрация обработчика события
  on(event: string, callback: Function): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // Удаление обработчика события
  off(event: string, callback: Function): void {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  // Вызов обработчиков для события
  private trigger(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Получение информации о текущем соединении
  getConnectionInfo() {
    return {
      isConnected: this.sessionCode !== null,
      sessionCode: this.sessionCode,
      playerName: this.playerName,
      characterId: this.characterId
    };
  }

  // Проверка активности соединения
  isConnected(): boolean {
    return this.sessionCode !== null;
  }
}

// Создаем и экспортируем синглтон для сервиса
export const socketService = new SocketService();

// Экспорт хука useSocket для использования в других компонентах
export { useSocket } from '@/contexts/SocketContext';
