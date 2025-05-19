
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';

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

// Алиас для совместимости
export const getCharacter = getCharacterById;

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

// Функция для получения персонажей конкретного пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  const allCharacters = await getAllCharacters();
  return allCharacters.filter(char => char.userId === userId);
};

// Функция saveCharacter для совместимости
export const saveCharacter = async (character: Character): Promise<string> => {
  // Добавляем поле userId, если его нет
  if (!character.userId) {
    character.userId = getCurrentUid();
  }
  
  // Если у персонажа нет id, создаем новый
  if (!character.id) {
    const newCharacter = await createCharacter(character);
    return newCharacter.id || '';
  }
  
  // Иначе обновляем существующий
  await updateCharacter(character);
  return character.id;
};

// Функция saveCharacterToFirestore для совместимости с Firebase
export const saveCharacterToFirestore = async (character: Character): Promise<Character> => {
  console.warn('saveCharacterToFirestore вызван, но функция сохраняет только локально');
  
  // Добавляем поле userId, если его нет
  if (!character.userId) {
    character.userId = getCurrentUid();
  }
  
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
