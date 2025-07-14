import { 
  ref, 
  get, 
  set, 
  remove
} from 'firebase/database';
import { db } from '@/lib/firebase';

// Сервис для работы с Realtime Database
export class DatabaseService {
  // Сохранение данных пользователя
  static async saveUser(userId: string, userData: any): Promise<void> {
    try {
      const userRef = ref(db, `users/${userId}`);
      await set(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      console.log('DatabaseService: Пользователь сохранен в Realtime Database');
    } catch (error) {
      console.error('DatabaseService: Ошибка сохранения пользователя:', error);
      throw error;
    }
  }

  // Получение данных пользователя
  static async getUser(userId: string): Promise<any | null> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('DatabaseService: Ошибка получения пользователя:', error);
      throw error;
    }
  }

  // Проверка существования пользователя
  static async userExists(userId: string): Promise<boolean> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('DatabaseService: Ошибка проверки пользователя:', error);
      return false;
    }
  }

  // Удаление пользователя
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);
      console.log('DatabaseService: Пользователь удален из Realtime Database');
    } catch (error) {
      console.error('DatabaseService: Ошибка удаления пользователя:', error);
      throw error;
    }
  }

  // Сохранение произвольных данных
  static async saveData(path: string, data: any): Promise<void> {
    try {
      const dataRef = ref(db, path);
      await set(dataRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log(`DatabaseService: Данные сохранены в Realtime Database по пути: ${path}`);
    } catch (error) {
      console.error(`DatabaseService: Ошибка сохранения данных по пути ${path}:`, error);
      throw error;
    }
  }

  // Получение произвольных данных
  static async getData(path: string): Promise<any | null> {
    try {
      const dataRef = ref(db, path);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error(`DatabaseService: Ошибка получения данных по пути ${path}:`, error);
      throw error;
    }
  }

  // Удаление произвольных данных
  static async deleteData(path: string): Promise<void> {
    try {
      const dataRef = ref(db, path);
      await remove(dataRef);
      console.log(`DatabaseService: Данные удалены из Realtime Database по пути: ${path}`);
    } catch (error) {
      console.error(`DatabaseService: Ошибка удаления данных по пути ${path}:`, error);
      throw error;
    }
  }
}