import { Character } from '@/types/character';
import { saveCharacter, getCharacter, deleteCharacter, getAllCharacters } from './characterService';
import { v4 as uuidv4 } from 'uuid';

// Экспортируем сервис персонажей
export { saveCharacter, getCharacter, deleteCharacter, getAllCharacters };

// Функции для работы с сессиями
export const saveSession = (session: any) => {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  const index = sessions.findIndex((s: any) => s.id === session.id);
  
  if (index !== -1) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem('sessions', JSON.stringify(sessions));
  return session;
};

export const getSession = (sessionId: string) => {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  return sessions.find((s: any) => s.id === sessionId) || null;
};

export const getAllSessions = () => {
  return JSON.parse(localStorage.getItem('sessions') || '[]');
};

export const deleteSession = (sessionId: string) => {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  const newSessions = sessions.filter((s: any) => s.id !== sessionId);
  localStorage.setItem('sessions', JSON.stringify(newSessions));
};

// Сервис для работы с сессиями
export const sessionService = {
  // Создание новой сессии
  createSession: async (name: string, description?: string): Promise<any> => {
    try {
      // Генерируем уникальный ID и код для сессии
      const sessionId = uuidv4();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Создаем объект сессии
      const session: any = {
        id: sessionId,
        title: name,
        description: description || '',
        code,
        dmId: '',
        players: [],
        users: [],
        createdAt: new Date().toISOString(),
        startTime: new Date().toISOString(),
        isActive: true,
        notes: []
      };
      
      // Сохраняем сессию
      saveSession(session);
      
      return session;
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
      return null;
    }
  },
  
  // Получение сессий пользователя
  getUserSessions: async (): Promise<any[]> => {
    try {
      const sessions = getAllSessions();
      return sessions;
    } catch (error) {
      console.error("Ошибка при получении сессий:", error);
      return [];
    }
  },
  
  // Получение сессии по ID
  getSessionById: async (sessionId: string): Promise<any | null> => {
    try {
      const session = getSession(sessionId);
      return session;
    } catch (error) {
      console.error("Ошибка при получении сессии:", error);
      return null;
    }
  },
  
  // Получение сессии по коду
  getSessionByCode: async (code: string): Promise<any | null> => {
    try {
      const sessions = getAllSessions();
      const session = sessions.find((s: any) => s.code === code);
      return session || null;
    } catch (error) {
      console.error("Ошибка при получении сессии по коду:", error);
      return null;
    }
  },
  
  // Присоединение к сессии
  joinSession: async (sessionId: string, user: any): Promise<boolean> => {
    try {
      const session = getSession(sessionId);
      if (!session) {
        return false;
      }
      
      const users = session.users || [];
      
      // Проверяем, не присоединился ли уже пользователь
      const existingUserIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (existingUserIndex !== -1) {
        // Обновляем данные пользователя
        users[existingUserIndex] = { ...users[existingUserIndex], ...user };
      } else {
        // Добавляем нового пользователя
        users.push(user);
      }
      
      // Обновляем сессию
      session.users = users;
      saveSession(session);
      
      return true;
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
      return false;
    }
  },
  
  // Удаление сессии
  deleteSession: async (sessionId: string): Promise<boolean> => {
    try {
      deleteSession(sessionId);
      return true;
    } catch (error) {
      console.error("Ошибка при удалении сессии:", error);
      return false;
    }
  },
  
  // Добавляем новые методы, которые используются в DMSessionPage
  updateSessionCode: async (sessionId: string): Promise<string | null> => {
    try {
      const session = getSession(sessionId);
      if (!session) {
        return null;
      }
      
      // Генерируем новый код
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Обновляем код в сессии
      session.code = newCode;
      saveSession(session);
      
      return newCode;
    } catch (error) {
      console.error("Ошибка при обновлении кода сессии:", error);
      return null;
    }
  },
  
  saveSessionNotes: async (sessionId: string, content: string): Promise<boolean> => {
    try {
      const session = getSession(sessionId);
      if (!session) {
        return false;
      }
      
      // Создаем новую заметку
      const newNote = {
        id: uuidv4(),
        content,
        timestamp: new Date().toISOString(),
        authorId: ''
      };
      
      // Добавляем заметку к существующим или создаем новый массив
      const notes = session.notes || [];
      notes.push(newNote);
      
      // Обновляем заметки в сессии
      session.notes = notes;
      saveSession(session);
      
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
      return false;
    }
  }
};

// Функции для работы с хранилищем Firebase
export const storageService = {
  // Загрузка изображения
  uploadImage: async (file: File, path: string): Promise<string | null> => {
    console.warn("Функция uploadImage не реализована");
    return null;
  },
  
  // Удаление изображения
  deleteImage: async (url: string): Promise<boolean> => {
    console.warn("Функция deleteImage не реализована");
    return false;
  }
};

export default { sessionService, storageService };
