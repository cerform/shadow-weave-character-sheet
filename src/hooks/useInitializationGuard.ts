import { useRef, useEffect } from 'react';

/**
 * Хук для защиты от повторной инициализации компонентов
 * Использует Set для отслеживания уже инициализированных ключей
 */
export function useInitializationGuard() {
  const initialized = useRef<Set<string>>(new Set());
  
  /**
   * Проверяет, нужно ли инициализировать компонент с данным ключом
   * @param id - уникальный идентификатор (например, sessionId)
   * @returns true если нужна инициализация, false если уже инициализирован
   */
  const shouldInitialize = (id: string): boolean => {
    if (initialized.current.has(id)) {
      return false;
    }
    initialized.current.add(id);
    return true;
  };
  
  /**
   * Сбрасывает инициализацию для конкретного ключа
   * Используется когда нужно переинициализировать компонент
   */
  const reset = (id: string) => {
    initialized.current.delete(id);
  };
  
  /**
   * Полностью очищает все guards
   */
  const resetAll = () => {
    initialized.current.clear();
  };
  
  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      initialized.current.clear();
    };
  }, []);
  
  return { shouldInitialize, reset, resetAll };
}
