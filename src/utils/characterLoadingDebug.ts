
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
      const allCharactersSnapshot = await getDocs(charactersRef);
      const allCharactersCount = allCharactersSnapshot.size;
      
      // Проверка доступа к персонажам конкретного пользователя
      const q = query(charactersRef, where("userId", "==", userId));
      const userCharactersSnapshot = await getDocs(q);
      const userCharactersCount = userCharactersSnapshot.size;
      
      // Собираем базовую информацию о персонажах для диагностики без доступа к Firebase объектам
      const sampleCharacters = userCharactersSnapshot.docs
        .slice(0, 3)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Без имени',
            userId: data.userId || 'отсутствует',
            hasUserId: !!data.userId
          };
        });
      
      return {
        success: true,
        message: `Диагностика успешна. Найдено всего ${allCharactersCount} персонажей, из них ${userCharactersCount} принадлежат пользователю`,
        debug: { 
          firestoreConnected: true,
          userId,
          totalCount: allCharactersCount,
          userCharactersCount: userCharactersCount,
          sampleCharacters
        }
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        error: `Ошибка доступа к коллекции персонажей: ${error}`,
        debug: { firestoreConnected: true, userId, error }
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Общая ошибка диагностики: ${errorMessage}`,
      debug: { error: errorMessage }
    };
  }
};
