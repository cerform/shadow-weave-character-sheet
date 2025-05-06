
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { getCurrentUid } from './authHelpers';

/**
 * Функция для диагностики проблем с загрузкой персонажей
 */
export const diagnoseCharacterLoading = async () => {
  try {
    const userId = getCurrentUid();
    
    if (!userId) {
      return {
        success: false,
        error: 'Пользователь не авторизован (uid отсутствует)',
        debug: { userIdExists: false }
      };
    }
    
    // Проверка доступа к Firestore
    if (!db) {
      return {
        success: false,
        error: 'База данных Firestore недоступна',
        debug: { firestoreConnected: false, userId }
      };
    }
    
    try {
      // Пробуем получить коллекцию персонажей без фильтрации
      const charactersRef = collection(db, 'characters');
      const allCharacters = await getDocs(charactersRef);
      
      // Проверка доступа к персонажам конкретного пользователя
      const q = query(charactersRef, where("userId", "==", userId));
      const userCharacters = await getDocs(q);
      
      return {
        success: true,
        message: `Диагностика успешна. Найдено всего ${allCharacters.size} персонажей, из них ${userCharacters.size} принадлежат пользователю`,
        debug: { 
          firestoreConnected: true,
          userId,
          totalCount: allCharacters.size,
          userCharactersCount: userCharacters.size,
          sampleUserIds: allCharacters.docs
            .slice(0, 3)
            .map(doc => ({ id: doc.id, userId: doc.data().userId }))
        }
      };
    } catch (e) {
      return {
        success: false,
        error: `Ошибка доступа к коллекции персонажей: ${e}`,
        debug: { firestoreConnected: true, userId, error: e }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Общая ошибка диагностики: ${error}`,
      debug: { error }
    };
  }
};
