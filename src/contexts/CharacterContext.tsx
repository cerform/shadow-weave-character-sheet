
import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveCharacter, getCharacter, deleteCharacter, getAllCharacters, getCharactersByUserId } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

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

export const CharacterContext = createContext<CharacterContextType>({
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

export const CharacterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Функция для обновления частичных данных персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };
  
  // Функция для принудительного обновления списка персонажей
  const refreshCharacters = async () => {
    await getUserCharacters();
  };
  
  // Функция для сохранения персонажа
  const saveCurrentCharacter = async () => {
    if (!character) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем, есть ли userId у персонажа
      const userId = getCurrentUid();
      if (userId && !character.userId) {
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
      
      // Проверяем, существует ли персонаж с таким же ID в списке персонажей
      if (updatedCharacter.id) {
        console.log(`Сохранение существующего персонажа с ID: ${updatedCharacter.id}`);
      }
      
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
      console.error('Ошибка при сохранении персонажа:', error);
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
        console.error('CharacterContext: ID пользователя не найден');
        setError('ID пользователя не найден');
        return [];
      }
      
      // Получаем персонажей конкретного пользователя
      const fetchedCharacters = await getCharactersByUserId(userId);
      console.log(`CharacterContext: Получено ${fetchedCharacters.length} персонажей`);
      
      // Фильтруем невалидные персонажи
      const validCharacters = fetchedCharacters.filter(char => char !== null && char.id);
      setCharacters(validCharacters);
      
      return validCharacters;
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
      setError('Не удалось загрузить персонажей');
      toast.error("Не удалось загрузить список персонажей.");
      return [];
    } finally {
      setLoading(false);
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
      console.error('Ошибка при получении персонажа:', error);
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
      console.error('Ошибка при удалении персонажа:', error);
      setError('Не удалось удалить персонажа');
      toast.error("Не удалось удалить персонажа. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };
  
  // При инициализации получаем список персонажей
  useEffect(() => {
    const loadCharacters = async () => {
      console.log('CharacterContext: Начальная загрузка персонажей');
      await getUserCharacters();
    };
    
    const userId = getCurrentUid();
    if (userId) {
      loadCharacters();
    } else {
      console.log('CharacterContext: Пользователь не авторизован, персонажи не загружаются');
    }
  }, []);
  
  return (
    <CharacterContext.Provider 
      value={{ 
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
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
