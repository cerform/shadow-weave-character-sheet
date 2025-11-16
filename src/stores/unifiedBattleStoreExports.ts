// ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Безопасные селекторы для предотвращения React Error #185
import { useMemo } from 'react';
import { useUnifiedBattleStore } from './unifiedBattleStore';

/**
 * Стабильный селектор для токенов с мемоизацией
 * Предотвращает лишние ререндеры при изменении других частей store
 */
export const useTokensStable = () => {
  const tokens = useUnifiedBattleStore((state) => state.tokens);
  
  // ✅ Мемоизируем массив, чтобы ссылка менялась только при реальных изменениях
  return useMemo(() => [...tokens], [tokens.length, tokens.map(t => t.id).join(',')]);
};

/**
 * Стабильный селектор для выбранного токена
 */
export const useSelectedTokenIdStable = () =>
  useUnifiedBattleStore((state) => state.selectedTokenId);

/**
 * Стабильный селектор для активного токена
 */
export const useActiveIdStable = () =>
  useUnifiedBattleStore((state) => state.activeId);

/**
 * Стабильный селектор для показа сетки перемещения
 */
export const useShowMovementGridStable = () =>
  useUnifiedBattleStore((state) => state.showMovementGrid);
