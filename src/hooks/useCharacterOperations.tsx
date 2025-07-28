import { useCallback } from 'react';
import * as characterService from '@/services/supabaseCharacterService';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { toast } from 'sonner';

export const useCharacterOperations = () => {
  const saveCharacter = useCallback(async (character: Character): Promise<Character> => {
    try {
      const dataToSave = { ...character };

      // Обновление или создание
      let result: Character;
      if (dataToSave.id) {
        await characterService.updateCharacter(dataToSave);
        result = dataToSave;
        toast.success('Персонаж обновлён');
      } else {
        result = await characterService.saveCharacter(dataToSave);
        toast.success('Персонаж создан');
      }

      return result;
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      throw error;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      await characterService.deleteCharacter(id);
      toast.success('Персонаж удалён');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления персонажа';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getUserCharacters = useCallback(async () => {
    console.log('Загрузка персонажей пользователя через Supabase');
    const userCharacters = await characterService.getUserCharacters();
    console.log('Получено персонажей:', userCharacters.length);
    return userCharacters;
  }, []);

  const getCharacterById = useCallback(async (id: string): Promise<Character | null> => {
    return await characterService.getCharacterById(id);
  }, []);

  const saveCurrentCharacter = useCallback(async (character: Character) => {
    if (!character) {
      throw new Error('Нет текущего персонажа для сохранения');
    }

    try {
      await saveCharacter(character);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения персонажа';
      toast.error(errorMessage);
      throw err;
    }
  }, [saveCharacter]);

  return {
    saveCharacter,
    deleteCharacter,
    getUserCharacters,
    getCharacterById,
    saveCurrentCharacter
  };
};
