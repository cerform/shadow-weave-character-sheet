import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Хук для сохранения состояния в sessionStorage
 * Позволяет сохранять UI состояние при переходах между страницами
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // Получаем сохраненное значение из sessionStorage
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading persisted state for key "${key}":`, error);
      return initialValue;
    }
  });

  // Сохраняем в sessionStorage при изменении
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving persisted state for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
