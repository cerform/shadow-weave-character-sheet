import { useCallback } from 'react';
import * as characterService from '@/services/characterService';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { toast } from 'sonner';

export const useCharacterOperations = () => {
  const saveCharacter = useCallback(async (character: Character): Promise<Character> => {
    try {
      const userId = getCurrentUid();
      if (!userId) throw new Error('Пользователь не авторизован');

      const dataToSave = { ...character };

      // Присваиваем userId, если его нет
      if (!dataToSave.userId) {
        dataToSave.userId = userId;
      }

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
    const userId = getCurrentUid();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    console.log('Загрузка персонажей для пользователя:', userId);
    const userCharacters = await characterService.getUserCharacters(userId);
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
