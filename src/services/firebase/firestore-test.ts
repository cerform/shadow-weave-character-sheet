
// Сервис для тестирования работы с Firestore

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Используем централизованный экспорт
import { Character } from '@/types/character';

/**
 * Тестовая загрузка персонажей для пользователя
 */
export const testLoadCharacters = async (): Promise<{
  success: boolean;
  message: string;
  characters: Character[];
  debug?: any;
}> => {
  try {
    // Проверяем, авторизован ли пользователь
    console.log('testLoadCharacters: Проверка авторизации');
    if (!auth.currentUser) {
      console.log('testLoadCharacters: Пользователь не авторизован');
      return {
        success: false,
        message: "Пользователь не авторизован",
        characters: [],
        debug: { error: "Отсутствует текущий пользователь" }
      };
    }
    
    const userId = auth.currentUser.uid;
    console.log('testLoadCharacters: Запрос персонажей для пользователя', userId);
    
    // Создаем запрос с фильтрацией по userId
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where("userId", "==", userId));
    
    try {
      // Получаем документы
      const snapshot = await getDocs(q);
      
      console.log(`testLoadCharacters: Найдено ${snapshot.docs.length} документов`);
      
      // Маппинг результатов
      const characters = snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as Character;
      });
      
      // Формируем отладочную информацию, используя только примитивные значения
      const debugInfo = {
        userId,
        authStatus: {
          isAuthenticated: !!auth.currentUser,
          email: auth.currentUser?.email || null
        },
        queryInfo: {
          collectionPath: 'characters',
          whereField: 'userId',
          whereValue: userId
        },
        resultsCount: snapshot.docs.length,
        documentIds: snapshot.docs.map(doc => doc.id)
      };
      
      return {
        success: true,
        message: `Успешно загружено ${characters.length} персонажей`,
        characters,
        debug: debugInfo
      };
    } catch (error) {
      console.error('testLoadCharacters: Ошибка при выполнении запроса:', error);
      return {
        success: false,
        message: `Ошибка при выполнении запроса: ${error}`,
        characters: [],
        debug: { error: String(error) }
      };
    }
  } catch (error) {
    console.error('testLoadCharacters: Ошибка:', error);
    return {
      success: false,
      message: `Ошибка: ${error}`,
      characters: [],
      debug: { error: String(error) }
    };
  }
};

/**
 * Получение информации о текущем пользователе
 */
export const getCurrentUserDetails = () => {
  const currentUser = auth.currentUser;
  
  // Возвращаем только простые данные, избегая сложных объектов
  return {
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    displayName: currentUser?.displayName || null,
    isAuthenticated: !!currentUser
  };
};
