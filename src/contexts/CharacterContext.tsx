
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { normalizeCharacter } from '@/utils/characterNormalizer';

export interface CharacterContextType {
  characters: Character[];
  currentCharacter: Character | null;
  loading: boolean;
  error: string | null;
  setCurrentCharacter: (character: Character | null) => void;
  setCharacter: (character: Character) => void;
  createCharacter: (characterData: Partial<Character>) => Character;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => Promise<void>;
  saveCurrentCharacter: () => Promise<Character | null>;
  getUserCharacters: (userId: string) => Promise<Character[]>;
  refreshCharacters: () => Promise<void>;
  character?: Character; // Для обратной совместимости
  getCharacterById?: (id: string) => Promise<Character | null>;
}

const CharacterContext = createContext<CharacterContextType>({
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,
  setCurrentCharacter: () => {},
  setCharacter: () => {},
  createCharacter: () => createDefaultCharacter(),
  updateCharacter: () => {},
  deleteCharacter: async () => {},
  saveCurrentCharacter: async () => null,
  getUserCharacters: async () => [],
  refreshCharacters: async () => {}
});

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // При монтировании компонента пытаемся загрузить персонажей из localStorage
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedCharactersJson = localStorage.getItem('dnd5e-characters');
        if (savedCharactersJson) {
          const savedCharacters = JSON.parse(savedCharactersJson) as Character[];
          console.log('CharacterProvider: Загружено персонажей из localStorage:', savedCharacters.length);
          
          // Нормализуем каждого персонажа для безопасности
          const normalizedCharacters = savedCharacters.map(char => {
            if (!char.id) char.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            return normalizeCharacter(char);
          });
          
          setCharacters(normalizedCharacters);
        } else {
          console.log('CharacterProvider: В localStorage нет сохраненных персонажей');
        }
      } catch (e) {
        console.error('Ошибка при загрузке персонажей из localStorage:', e);
      }
    };
    
    loadFromStorage();
  }, []);
  
  // Автоматическое сохранение персонажей в localStorage при изменении списка
  useEffect(() => {
    if (characters.length > 0) {
      console.log('CharacterProvider: Сохраняем персонажей в localStorage:', characters.length);
      localStorage.setItem('dnd5e-characters', JSON.stringify(characters));
    }
  }, [characters]);

  const setCharacter = (character: Character) => {
    // Проверка, существует ли персонаж уже в списке
    const existingIndex = characters.findIndex(c => c.id === character.id);
    if (existingIndex !== -1) {
      // Обновление существующего персонажа
      const updatedCharacters = [...characters];
      updatedCharacters[existingIndex] = character;
      setCharacters(updatedCharacters);
    } else {
      // Добавление нового персонажа
      setCharacters([...characters, character]);
    }
  };

  const createCharacter = (characterData: Partial<Character>): Character => {
    // Создаем базового персонажа с уникальным ID
    const newCharacter = {
      ...createDefaultCharacter(),
      ...characterData,
      id: Date.now().toString(), // Используем timestamp для уникальности
      createdAt: new Date().toISOString(), // Добавляем дату создания
      updatedAt: new Date().toISOString() // Добавляем дату обновления
    };
    
    // Нормализуем персонажа для согласованности данных
    const normalized = normalizeCharacter(newCharacter);
    
    // Добавляем персонажа в список и сохраняем
    setCharacters(prevChars => [...prevChars, normalized]);
    
    console.log('CharacterProvider: Создан новый персонаж:', normalized.name);
    
    return normalized;
  };

  const updateCharacter = (character: Character) => {
    const updatedChar = {
      ...character,
      updatedAt: new Date().toISOString() // Обновляем дату изменения
    };
    
    setCharacters(prevChars => 
      prevChars.map(c => c.id === character.id ? updatedChar : c)
    );
    
    if (currentCharacter?.id === character.id) {
      setCurrentCharacter(updatedChar);
    }
    
    console.log('CharacterProvider: Обновлен персонаж:', character.name);
  };

  const deleteCharacter = async (id: string) => {
    setCharacters(prevChars => prevChars.filter(c => c.id !== id));
    
    if (currentCharacter?.id === id) {
      setCurrentCharacter(null);
    }
    
    console.log('CharacterProvider: Удален персонаж с ID:', id);
    
    // Обновляем localStorage после удаления
    const updatedCharacters = characters.filter(c => c.id !== id);
    localStorage.setItem('dnd5e-characters', JSON.stringify(updatedCharacters));
  };

  // Добавляем недостающие методы
  const saveCurrentCharacter = async (): Promise<Character | null> => {
    if (!currentCharacter) return null;
    
    try {
      // Обновляем дату изменения
      const updatedChar = {
        ...currentCharacter,
        updatedAt: new Date().toISOString()
      };
      
      // Обновляем персонажа в списке
      updateCharacter(updatedChar);
      
      // Сохраняем обновленный список в localStorage
      localStorage.setItem('dnd5e-characters', JSON.stringify(
        characters.map(c => c.id === updatedChar.id ? updatedChar : c)
      ));
      
      console.log('CharacterProvider: Сохранен персонаж:', updatedChar.name);
      
      return updatedChar;
    } catch (e) {
      console.error('Ошибка при сохранении персонажа:', e);
      setError('Не удалось сохранить персонажа');
      return null;
    }
  };
  
  const getUserCharacters = async (userId: string): Promise<Character[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Загрузка персонажей для пользователя:', userId);
      
      // Загружаем из localStorage
      const savedCharactersJson = localStorage.getItem('dnd5e-characters');
      if (savedCharactersJson) {
        const savedCharacters = JSON.parse(savedCharactersJson) as Character[];
        
        // Фильтруем по userId и/или добавляем userId, если его нет
        const userCharacters = savedCharacters.map(char => {
          if (!char.userId) {
            return { ...char, userId };
          }
          return char;
        }).filter(char => !char.userId || char.userId === userId);
        
        // Обновляем состояние
        setCharacters(userCharacters);
        console.log(`CharacterProvider: Загружено ${userCharacters.length} персонажей пользователя ${userId}`);
        
        return userCharacters;
      } else {
        console.log('CharacterProvider: В localStorage нет сохраненных персонажей');
        
        // Создаем демо-персонажа, если в списке ничего нет
        if (characters.length === 0) {
          const demoCharacter = createCharacter({
            name: 'Гронд Каменный Кулак',
            race: 'Полуорк',
            class: 'Варвар',
            level: 1,
            userId
          });
          return [demoCharacter];
        }
        
        return characters;
      }
    } catch (err) {
      console.error('Ошибка загрузки персонажей:', err);
      setError('Ошибка загрузки персонажей');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const refreshCharacters = async (): Promise<void> => {
    try {
      setLoading(true);
      // Обновляем персонажей из localStorage
      const savedCharactersJson = localStorage.getItem('dnd5e-characters');
      if (savedCharactersJson) {
        const savedCharacters = JSON.parse(savedCharactersJson) as Character[];
        setCharacters(savedCharacters);
      }
      console.log('CharacterProvider: Список персонажей обновлен');
    } catch (e) {
      console.error('Ошибка при обновлении списка персонажей:', e);
      setError('Не удалось обновить список персонажей');
    } finally {
      setLoading(false);
    }
  };

  // Добавляем метод для получения персонажа по ID
  const getCharacterById = async (id: string): Promise<Character | null> => {
    // Сначала ищем в текущем списке
    const foundCharacter = characters.find(c => c.id === id);
    if (foundCharacter) return foundCharacter;
    
    // Имитация загрузки из хранилища если не найдено в памяти
    try {
      const savedCharactersJson = localStorage.getItem('dnd5e-characters');
      if (savedCharactersJson) {
        const savedCharacters = JSON.parse(savedCharactersJson) as Character[];
        const found = savedCharacters.find(c => c.id === id);
        if (found) return found;
      }
      
      const storedChar = localStorage.getItem(`character_${id}`);
      if (storedChar) {
        const parsedChar = JSON.parse(storedChar) as Character;
        return parsedChar;
      }
    } catch (e) {
      console.error("Ошибка при загрузке персонажа из хранилища:", e);
    }
    
    return null;
  };

  return (
    <CharacterContext.Provider 
      value={{ 
        characters, 
        currentCharacter,
        loading,
        error,
        setCurrentCharacter, 
        setCharacter, 
        createCharacter,
        updateCharacter, 
        deleteCharacter,
        saveCurrentCharacter,
        getUserCharacters,
        refreshCharacters,
        getCharacterById,
        character: currentCharacter // Для обратной совместимости
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
