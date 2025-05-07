
import { GameSession, TokenData, Initiative } from '@/types/session.types';

// Получение сессии по ID
export const getSessionById = async (sessionId: string): Promise<GameSession | null> => {
  try {
    // Здесь обычно был бы запрос к API/Firebase
    // Для демо используем локальное хранилище
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    const session = sessions.find((s: GameSession) => s.id === sessionId);
    return session || null;
  } catch (error) {
    console.error('Ошибка при получении сессии:', error);
    throw error;
  }
};

// Получение списка сессий DM
export const getDMSessions = async (): Promise<GameSession[]> => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.uid) return [];

    const allSessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    return allSessions.filter((session: GameSession) => session.dmId === currentUser.uid);
  } catch (error) {
    console.error('Ошибка при получении сессий DM:', error);
    return [];
  }
};

// Получение списка сессий игрока
export const getPlayerSessions = async (): Promise<GameSession[]> => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.uid) return [];

    const allSessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    return allSessions.filter((session: GameSession) => 
      session.players.some(player => player.userId === currentUser.uid)
    );
  } catch (error) {
    console.error('Ошибка при получении сессий игрока:', error);
    return [];
  }
};

// Создание новой игровой сессии
export const createGameSession = async (
  name: string, 
  description: string = ''
): Promise<GameSession> => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.uid) {
      throw new Error('Пользователь не авторизован');
    }

    // Генерируем случайный код для сессии
    const generateSessionCode = (): string => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const newSession: GameSession = {
      id: Date.now().toString(),
      name,
      description,
      dmId: currentUser.uid,
      players: [],
      code: generateSessionCode(),
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Сохраняем в локальное хранилище
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    sessions.push(newSession);
    localStorage.setItem('dnd-sessions', JSON.stringify(sessions));

    return newSession;
  } catch (error) {
    console.error('Ошибка при создании игровой сессии:', error);
    throw error;
  }
};

// Получение токенов для сессии
export const getSessionTokens = async (sessionId: string): Promise<TokenData[]> => {
  try {
    // Здесь обычно был бы запрос к API/Firebase
    // Для демо используем локальное хранилище или возвращаем пустой массив
    const session = await getSessionById(sessionId);
    return session?.tokens || [];
  } catch (error) {
    console.error('Ошибка при получении токенов:', error);
    return [];
  }
};

// Обновление токена
export const updateToken = async (sessionId: string, token: TokenData): Promise<TokenData> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: GameSession) => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Сессия не найдена');
    }
    
    const session = sessions[sessionIndex];
    
    // Если токены не инициализированы, создаем массив
    if (!session.tokens) {
      session.tokens = [];
    }
    
    // Ищем токен по ID и обновляем его
    const tokenIndex = session.tokens.findIndex((t: TokenData) => t.id === token.id);
    
    if (tokenIndex !== -1) {
      // Обновляем существующий токен
      session.tokens[tokenIndex] = token;
    } else {
      // Добавляем новый токен
      session.tokens.push(token);
    }
    
    // Сохраняем обновленную сессию
    sessions[sessionIndex] = session;
    localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    
    return token;
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error);
    throw error;
  }
};

// Удаление токена
export const removeToken = async (sessionId: string, tokenId: string | number): Promise<void> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: GameSession) => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Сессия не найдена');
    }
    
    const session = sessions[sessionIndex];
    
    if (session.tokens) {
      // Удаляем токен по ID
      session.tokens = session.tokens.filter((t: TokenData) => t.id !== tokenId);
      
      // Сохраняем обновленную сессию
      sessions[sessionIndex] = session;
      localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
    throw error;
  }
};

// Присоединение к сессии по коду
export const joinSessionByCode = async (code: string, player: { userId: string, name: string, characterId?: string }): Promise<GameSession> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: GameSession) => s.code === code);
    
    if (sessionIndex === -1) {
      throw new Error('Сессия не найдена');
    }
    
    const session = sessions[sessionIndex];
    
    // Проверяем, не присоединился ли игрок уже
    const playerExists = session.players.some(p => p.userId === player.userId);
    
    if (!playerExists) {
      // Добавляем нового игрока
      session.players.push({
        id: Date.now().toString(),
        userId: player.userId,
        name: player.name,
        characterId: player.characterId,
        isConnected: true,
        lastActivity: new Date().toISOString()
      });
      
      // Сохраняем обновленную сессию
      sessions[sessionIndex] = session;
      localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    }
    
    return session;
  } catch (error) {
    console.error('Ошибка при присоединении к сессии:', error);
    throw error;
  }
};

// Выход из сессии
export const leaveSession = async (sessionId: string, userId: string): Promise<void> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('dnd-sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: GameSession) => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Сессия не найдена');
    }
    
    const session = sessions[sessionIndex];
    
    // Обновляем статус игрока
    const playerIndex = session.players.findIndex(p => p.userId === userId);
    
    if (playerIndex !== -1) {
      session.players[playerIndex].isConnected = false;
      session.players[playerIndex].lastActivity = new Date().toISOString();
      
      // Сохраняем обновленную сессию
      sessions[sessionIndex] = session;
      localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Ошибка при выходе из сессии:', error);
    throw error;
  }
};
