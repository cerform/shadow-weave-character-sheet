
import { Character } from '@/types/character';

// Функция для создания нового персонажа
export const createCharacter = async (character: Character): Promise<Character> => {
  // Создаем копию персонажа с уникальным ID и датой создания
  const newCharacter: Character = {
    ...character,
    id: character.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Сохраняем в localStorage
  if (newCharacter.id) {
    localStorage.setItem(`character_${newCharacter.id}`, JSON.stringify(newCharacter));
  }
  
  return newCharacter;
};

// Функция для обновления персонажа
export const updateCharacter = async (character: Character): Promise<Character> => {
  if (!character.id) {
    throw new Error("Персонаж должен иметь ID");
  }
  
  // Обновляем дату изменения
  const updatedCharacter: Character = {
    ...character,
    updatedAt: new Date().toISOString()
  };
  
  // Сохраняем в localStorage
  localStorage.setItem(`character_${character.id}`, JSON.stringify(updatedCharacter));
  
  return updatedCharacter;
};

// Функция для получения персонажа по ID
export const getCharacterById = async (id: string): Promise<Character | null> => {
  const characterJson = localStorage.getItem(`character_${id}`);
  
  if (!characterJson) {
    return null;
  }
  
  return JSON.parse(characterJson) as Character;
};

// Функция для получения списка персонажей
export const getAllCharacters = async (): Promise<Character[]> => {
  const characters: Character[] = [];
  
  // Получаем все ключи из localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('character_')) {
      try {
        const characterJson = localStorage.getItem(key);
        if (characterJson) {
          const character = JSON.parse(characterJson) as Character;
          characters.push(character);
        }
      } catch (error) {
        console.error('Ошибка при чтении персонажа:', error);
      }
    }
  }
  
  // Сортируем по дате обновления (сначала новые)
  return characters.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
};

// Функция для удаления персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  localStorage.removeItem(`character_${id}`);
};

// Функция saveCharacterToFirestore для совместимости с Firebase
export const saveCharacterToFirestore = async (character: Character): Promise<Character> => {
  console.warn('saveCharacterToFirestore вызван, но функция сохраняет только локально');
  
  // Если у персонажа нет id, создаем новый
  if (!character.id) {
    return createCharacter(character);
  }
  
  // Иначе обновляем существующий
  return updateCharacter(character);
};

// Функция для создания уникального ID
export const generateCharacterId = (): string => {
  return crypto.randomUUID();
};
