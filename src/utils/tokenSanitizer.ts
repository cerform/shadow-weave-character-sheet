import { useMemo } from 'react';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';

/**
 * Глубокое клонирование объекта для избежания Zustand Proxy
 * Критично для предотвращения React Error #185
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone) as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Санитизация массива токенов для предотвращения React Error #185:
 * 1. Фильтрация undefined/null/невалидных токенов
 * 2. Глубокое клонирование (убирает Zustand Proxy)
 * 3. Стабильная сортировка по ID
 */
export function sanitizeTokens(tokens: EnhancedToken[]): EnhancedToken[] {
  if (!Array.isArray(tokens)) return [];
  
  return tokens
    .filter(token => {
      // Проверяем валидность токена
      if (!token || typeof token !== 'object') return false;
      if (!token.id || typeof token.id !== 'string') return false;
      if (!token.position || !Array.isArray(token.position)) return false;
      return true;
    })
    .map(token => deepClone(token)) // Глубокое клонирование убирает Zustand Proxy
    .sort((a, b) => {
      // Стабильная сортировка по ID
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idA.localeCompare(idB);
    });
}

/**
 * React хук для мемоизированной санитизации токенов
 */
export function useSanitizedTokens(tokens: EnhancedToken[]): EnhancedToken[] {
  return useMemo(() => sanitizeTokens(tokens), [tokens]);
}
