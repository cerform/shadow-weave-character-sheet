
import { useEffect, useRef } from 'react';
import { Character } from '@/types/character';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // в миллисекундах
  key?: string;
}

export const useAutoSave = (
  character: Character,
  options: UseAutoSaveOptions = {}
) => {
  const {
    enabled = true,
    interval = 30000, // 30 секунд по умолчанию
    key = 'character_autosave'
  } = options;

  const lastSaveRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !character) return;

    // Сравниваем текущее состояние с последним сохраненным
    const currentState = JSON.stringify(character);
    if (currentState === lastSaveRef.current) return;

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер для автосохранения
    timeoutRef.current = setTimeout(() => {
      try {
        const saveKey = character.id ? `${key}_${character.id}` : key;
        const saveData = {
          character,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        lastSaveRef.current = currentState;
        
        console.log('Персонаж автоматически сохранен');
      } catch (error) {
        console.error('Ошибка автосохранения:', error);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [character, enabled, interval, key]);

  // Функция для ручного восстановления из автосохранения
  const restoreFromAutoSave = (): Character | null => {
    try {
      const saveKey = character.id ? `${key}_${character.id}` : key;
      const saved = localStorage.getItem(saveKey);
      
      if (saved) {
        const saveData = JSON.parse(saved);
        return saveData.character;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка восстановления автосохранения:', error);
      return null;
    }
  };

  // Функция для проверки наличия автосохранения
  const hasAutoSave = (): boolean => {
    try {
      const saveKey = character.id ? `${key}_${character.id}` : key;
      return localStorage.getItem(saveKey) !== null;
    } catch {
      return false;
    }
  };

  // Функция для очистки автосохранения
  const clearAutoSave = () => {
    try {
      const saveKey = character.id ? `${key}_${character.id}` : key;
      localStorage.removeItem(saveKey);
    } catch (error) {
      console.error('Ошибка очистки автосохранения:', error);
    }
  };

  return {
    restoreFromAutoSave,
    hasAutoSave,
    clearAutoSave
  };
};
