import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveCharacter, getCharacter, deleteCharacter, getAllCharacters, getCharactersByUserId } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';
import { useAuth } from '@/hooks/use-auth';

export interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  characters: Character[];
  getUserCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  getCharacterById: (id: string) => Promise<Character | null>;
  refreshCharacters: () => Promise<void>;
}

// Создаем контекст с дефолтными значениями
const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  characters: [],
  getUserCharacters: async () => [],
  deleteCharacter: async () => {},
  loading: false,
  error: null,
  getCharacterById: async () => null,
  refreshCharacters: async () => {},
});

// Исправляем определение провайдера для корректной работы Fast Refresh
export const CharacterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Функция для обновления частичных данных персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };
  
  // Функция для принудительного обновления списка персонажей
  const refreshCharacters = async () => {
    console.log('CharacterContext: Запуск принудительного обновления списка персонажей');
    console.log('CharacterContext: isAuthenticated =', isAuthenticated);
    console.log('CharacterContext: user =', user);
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем, авторизован ли пользователь и есть ли его ID
      if (!isAuthenticated) {
        console.warn('CharacterContext: Попытка обновить персонажей неавторизованным пользователем');
        setError('Пользователь не авторизован');
        setCharacters([]);
        return Promise.resolve();
      }
      
      if (!user?.uid) {
        console.warn('CharacterContext: ID пользователя отсутствует');
        setError('ID пользователя не найден');
        setCharacters([]);
        return Promise.resolve();
      }
      
      console.log('CharacterContext: Загрузка персонажей для пользователя', user.uid);
      
      const result = await getUserCharacters();
      console.log('CharacterContext: Список персонажей обновлен, получено:', result.length);
      return Promise.resolve();
    } catch (err) {
      console.error('CharacterContext: Ошибка при обновлении персонажей:', err);
      setError('Не удалось обновить список персонажей');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для сохранения персонажа
  const saveCurrentCharacter = async () => {
    if (!character) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Получаем userId и проверяем его корректность
      const userId = getCurrentUid();
      if (!userId) {
        console.error('saveCurrentCharacter: ID пользователя не найден');
        setError('ID пользователя не найден');
        return;
      }
      
      // Явно проверяем и устанавливаем userId ��ак строку
      if (!character.userId || character.userId !== userId) {
        console.log('saveCurrentCharacter: Устанавливаем корректный userId:', userId);
        character.userId = userId;
      }
      
      const updatedCharacter = { 
        ...character, 
        updatedAt: new Date().toISOString(),
        backstory: character.backstory || ''
      };
      
      if (!updatedCharacter.createdAt) {
        updatedCharacter.createdAt = new Date().toISOString();
      }
      
      // Сохраняем персонажа
      console.log(`CharacterContext: Сохраняем персонажа ${updatedCharacter.name || 'Безымянный'}${updatedCharacter.id ? ' с ID ' + updatedCharacter.id : ''}`, 
        'userId:', updatedCharacter.userId);
      const savedCharId = await saveCharacter(updatedCharacter);
      
      if (savedCharId) {
        // Обновляем ID только если его не было раньше
        if (!updatedCharacter.id) {
          setCharacter({...updatedCharacter, id: savedCharId});
        }
        toast.success(`${updatedCharacter.name || 'Персонаж'} успешно сохранен`);
      }
      
      // Обновляем список персонажей
      await getUserCharacters();
    } catch (error) {
      console.error('CharacterContext: Ошибка при сохранении персонажа:', error);
      setError('Не удалось сохранить персонажа');
      toast.error("Не удалось сохранить персонажа. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };
  
  // Получаем список персонажей пользователя
  const getUserCharacters = async () => {
    try {
      console.log('CharacterContext: Получение персонажей пользователя');
      setLoading(true);
      setError(null);
      
      // Получаем userId текущего пользователя
      const userId = getCurrentUid();
      if (!userId) {
        console.error('CharacterContext: ID пользователя не найден методом getCurrentUid()');
        // Пробуем получить ID из объекта user
        const alternativeUserId = user?.uid;
        if (!alternativeUserId) {
          console.error('CharacterContext: ID пользователя также не найден в объекте user');
          setError('ID пользователя не найден');
          setCharacters([]);
          return [];
        }
        
        console.log('CharacterContext: Используем альтернативный ID пользователя:', alternativeUserId);
        
        // Получаем персонажей используя альтернативный userId
        const fetchedCharacters = await getCharactersByUserId(String(alternativeUserId));
        console.log(`CharacterContext: Получено ${fetchedCharacters.length} персонажей от сервиса с альтернативным ID`);
        
        // Фильтруем невалидные персонажи и добавляем отладочные данные
        const validCharacters = fetchedCharacters
          .filter(char => char !== null && char.id)
          .map(char => {
            if (!char.userId) {
              console.warn(`CharacterContext: У персонажа ${char.name || 'Без имени'} (${char.id}) отсутствует userId, устанавливаем текущий`);
              return {...char, userId: String(alternativeUserId)};
            }
            return char;
          });
        
        console.log(`CharacterContext: После фильтрации осталось ${validCharacters.length} персонажей`);
        
        // Устанавливаем персонажи в состояние
        setCharacters(validCharacters);
        
        // Сбрасываем состояние загрузки и ошибок
        setLoading(false);
        setError(null);
        
        return validCharacters;
      }
      
      console.log('CharacterContext: ID пользователя:', userId, 'тип:', typeof userId);
      
      // Получаем персонажей конкретного пользователя, явно передавая userId как строку
      const fetchedCharacters = await getCharactersByUserId(String(userId));
      console.log(`CharacterContext: Получено ${fetchedCharacters.length} персонажей от сервиса`);
      
      // Фильтруем невалидные персонажи и добавляем отладочные данные
      const validCharacters = fetchedCharacters
        .filter(char => char !== null && char.id)
        .map(char => {
          if (!char.userId) {
            console.warn(`CharacterContext: У персонажа ${char.name || 'Без имени'} (${char.id}) отсутствует userId, устанавливаем текущий`);
            return {...char, userId: String(userId)};
          }
          return char;
        });
      
      console.log(`CharacterContext: После фильтрации осталось ${validCharacters.length} персонажей`);
      console.log('CharacterContext: Персонажи:', validCharacters);
      
      // Устанавливаем персонажи в состояние
      setCharacters(validCharacters);
      
      // Сбрасываем состояние загрузки и ошибок
      setLoading(false);
      setError(null);
      
      // Вернем полученные персонажи для использования в вызывающем коде
      return validCharacters;
    } catch (error) {
      console.error('CharacterContext: Ошибка при получении персонажей:', error);
      setError('Не удалось загрузить персонажей');
      setLoading(false);
      toast.error("Не удалось загрузить список персонажей.");
      return [];
    }
  };
  
  // Получение персонажа по ID
  const getCharacterById = async (id: string) => {
    try {
      console.log('CharacterContext: Получение персонажа по ID:', id);
      setLoading(true);
      setError(null);
      
      const fetchedCharacter = await getCharacter(id);
      
      // Проверяем валидность полученного персонажа
      if (!fetchedCharacter || !fetchedCharacter.id) {
        console.log('CharacterContext: Персонаж не найден или не валиден');
        return null;
      }
      
      console.log('CharacterContext: Персонаж получен успешно:', fetchedCharacter.name);
      return fetchedCharacter;
    } catch (error) {
      console.error('CharacterContext: Ошибка при получении персонажа:', error);
      setError(`Не удалось загрузить персонажа с ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      console.log('CharacterContext: Удаление персонажа с ID:', id);
      setLoading(true);
      setError(null);
      
      await deleteCharacter(id);
      setCharacters(prev => prev.filter(char => char.id !== id));
      
      toast.success("Персонаж успешно удален");
      
      // Если удаляем текущего персонажа, сбрасываем его
      if (character && character.id === id) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('CharacterContext: Ошибка при удалении персонажа:', error);
      setError('Не удалось удалить персонажа');
      toast.error("Не удалось удалить персонажа. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };
  
  // При изменении состояния авторизации загружаем персонажей
  useEffect(() => {
    console.log('CharacterContext: Эффект авторизации. isAuthenticated =', isAuthenticated, 'user?.uid =', user?.uid);
    
    if (isAuthenticated && user?.uid) {
      console.log('CharacterContext: Пользователь авторизован, загружаем персонажей. userId:', user.uid);
      
      // Устанавливаем флаг загрузки
      setLoading(true);
      
      // Загружаем персонажей
      getUserCharacters()
        .then((chars) => {
          console.log('CharacterContext: Персонажи загружены успешно, количество:', chars.length);
          setInitialLoadDone(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error('CharacterContext: Ошибка при загрузке персонажей:', err);
          setError('Ошибка при загрузке персонажей');
          setInitialLoadDone(true);
          setLoading(false);
        });
    } else {
      console.log('CharacterContext: Пользователь не авторизован, персонажи не загружаются');
      setLoading(false);
      setCharacters([]);
      setInitialLoadDone(isAuthenticated === false); // Отметить как завершено, если явно не авторизован
    }
  }, [isAuthenticated, user?.uid]);
  
  // Отладочная информация при изменении состояния
  useEffect(() => {
    console.log(`CharacterContext: Состояние - персонажей: ${characters.length}, загрузка: ${loading}, ошибка: ${error || 'нет'}, initialLoadDone: ${initialLoadDone}`);
  }, [characters, loading, error, initialLoadDone]);
  
  // Создаем объект контекста
  const contextValue = { 
    character, 
    setCharacter,
    updateCharacter, 
    saveCurrentCharacter,
    characters,
    getUserCharacters,
    getCharacterById,
    deleteCharacter: handleDeleteCharacter,
    loading,
    error,
    refreshCharacters
  };
  
  return (
    <CharacterContext.Provider value={contextValue}>
      {children}
    </CharacterContext.Provider>
  );
};

// Экспортируем хук для использования контекста
export const useCharacter = () => useContext(CharacterContext);

// Экспортируем сам контекст для совместимости
export default CharacterContext;
