// Хуки для работы с персонажами
import { useCallback } from 'react';
import * as characterService from '@/services/characterService';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { toast } from 'sonner';

export const useCharacterOperations = () => {
  
  const saveCharacter = useCallback(async (character: Character): Promise<Character> => {
    try {
      console.log('useCharacterOperations: Начинаем сохранение персонажа:', character.name);
      
      // Добавляем userId если его нет
      if (!character.userId) {
        character.userId = getCurrentUid();
      }

      // Сохраняем персонажа в Firebase Realtime Database
      const savedCharacter = await characterService.saveCharacter(character);
      console.log('useCharacterOperations: Персонаж сохранен в Firebase:', savedCharacter.id);
      return savedCharacter;
    } catch (error) {
      console.error('Критическая ошибка сохранения персонажа:', error);
      throw error;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      await characterService.deleteCharacter(id);
      toast.success('Персонаж удален');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления персонажа';
      throw new Error(errorMessage);
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
      await characterService.saveCharacter(character);
      toast.success('Персонаж сохранен');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения персонажа';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    saveCharacter,
    deleteCharacter,
    getUserCharacters,
    getCharacterById,
    saveCurrentCharacter
  };
};