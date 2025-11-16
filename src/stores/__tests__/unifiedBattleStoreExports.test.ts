import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnifiedBattleStore } from '../unifiedBattleStore';
import { useTokensStable } from '../unifiedBattleStoreExports';
import type { EnhancedToken } from '../enhancedBattleStore';

describe('Stable Selectors - React Error #185 Protection', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    const { resetAll } = useUnifiedBattleStore.getState();
    resetAll();
  });

  describe('useTokensStable', () => {
    it('должен возвращать стабильную ссылку при одинаковых токенах', () => {
      const { result, rerender } = renderHook(() => useTokensStable());
      
      const firstRender = result.current;
      
      // Ререндерим без изменений
      rerender();
      
      const secondRender = result.current;
      
      // Проверяем, что ссылки одинаковые (мемоизация работает)
      expect(firstRender).toBe(secondRender);
    });

    it('должен обновлять ссылку при изменении длины массива токенов', () => {
      const { result } = renderHook(() => useTokensStable());
      
      const initialTokens = result.current;
      
      // Добавляем токен
      act(() => {
        useUnifiedBattleStore.getState().addToken({
          name: 'Test Token',
          position: [0, 0, 0],
          hp: 10,
          maxHp: 10,
          ac: 15,
          speed: 6,
          conditions: [],
          isEnemy: false,
          hasMovedThisTurn: false,
        });
      });
      
      const updatedTokens = result.current;
      
      // Ссылка должна измениться
      expect(initialTokens).not.toBe(updatedTokens);
      expect(updatedTokens.length).toBe(1);
    });

    it('должен обновлять ссылку при изменении ID токенов', () => {
      // Добавляем первый токен
      act(() => {
        useUnifiedBattleStore.getState().addToken({
          name: 'Token 1',
          position: [0, 0, 0],
          hp: 10,
          maxHp: 10,
          ac: 15,
          speed: 6,
          conditions: [],
          isEnemy: false,
          hasMovedThisTurn: false,
        });
      });

      const { result } = renderHook(() => useTokensStable());
      const tokensBeforeAdd = result.current;
      
      // Добавляем второй токен
      act(() => {
        useUnifiedBattleStore.getState().addToken({
          name: 'Token 2',
          position: [1, 0, 1],
          hp: 15,
          maxHp: 15,
          ac: 12,
          speed: 6,
          conditions: [],
          isEnemy: true,
          hasMovedThisTurn: false,
        });
      });
      
      const tokensAfterAdd = result.current;
      
      // Ссылка должна измениться
      expect(tokensBeforeAdd).not.toBe(tokensAfterAdd);
      expect(tokensAfterAdd.length).toBe(2);
      expect(tokensAfterAdd[0].name).toBe('Token 1');
      expect(tokensAfterAdd[1].name).toBe('Token 2');
    });

    it('НЕ должен ререндерить при изменении других полей store', () => {
      const { result } = renderHook(() => useTokensStable());
      
      const tokensBeforeChange = result.current;
      
      // Меняем другое поле (не токены)
      act(() => {
        useUnifiedBattleStore.getState().setShowMovementGrid(true);
      });
      
      const tokensAfterChange = result.current;
      
      // Ссылка должна остаться той же
      expect(tokensBeforeChange).toBe(tokensAfterChange);
    });

    it('должен предотвращать лишние рендеры при обновлении позиции токена', () => {
      // Добавляем токен
      act(() => {
        useUnifiedBattleStore.getState().addToken({
          name: 'Moving Token',
          position: [0, 0, 0],
          hp: 10,
          maxHp: 10,
          ac: 15,
          speed: 6,
          conditions: [],
          isEnemy: false,
          hasMovedThisTurn: false,
        });
      });

      const { result } = renderHook(() => useTokensStable());
      
      const tokensBeforeMove = result.current;
      const tokenId = tokensBeforeMove[0].id;
      
      // Обновляем позицию
      act(() => {
        useUnifiedBattleStore.getState().updateToken(tokenId, {
          position: [1, 0, 1],
        });
      });
      
      const tokensAfterMove = result.current;
      
      // Ссылка должна измениться только если изменились критичные поля
      expect(tokensBeforeMove).not.toBe(tokensAfterMove);
      expect(tokensAfterMove[0].position).toEqual([1, 0, 1]);
    });
  });

  describe('Rules of Hooks Compliance', () => {
    it('должен вызывать хуки в одном и том же порядке при каждом рендере', () => {
      let renderCount = 0;
      
      const { rerender } = renderHook(() => {
        renderCount++;
        const tokens = useTokensStable();
        return { tokens, renderCount };
      });
      
      // Первый рендер
      expect(renderCount).toBe(1);
      
      // Несколько ререндеров
      rerender();
      rerender();
      rerender();
      
      // Рендеры должны пройти без ошибок
      expect(renderCount).toBe(4);
    });

    it('НЕ должен вызывать хуки условно', () => {
      const { result } = renderHook(({ condition }) => {
        // ✅ Правильно: хук всегда вызывается
        const tokens = useTokensStable();
        
        // ✅ Условная логика ПОСЛЕ вызова хука
        if (condition) {
          return tokens.filter(t => t.isEnemy);
        }
        return tokens;
      }, {
        initialProps: { condition: false }
      });
      
      expect(result.current).toBeDefined();
    });
  });

  describe('Performance - Предотвращение лишних рендеров', () => {
    it('должен минимизировать количество обновлений при множественных изменениях', () => {
      let renderCount = 0;
      
      renderHook(() => {
        renderCount++;
        return useTokensStable();
      });
      
      const initialRenderCount = renderCount;
      
      // Множественные изменения других полей
      act(() => {
        useUnifiedBattleStore.getState().setShowMovementGrid(true);
        useUnifiedBattleStore.getState().setFogEnabled(false);
        useUnifiedBattleStore.getState().setCameraMode(true);
      });
      
      // Количество рендеров не должно увеличиться
      expect(renderCount).toBe(initialRenderCount);
    });
  });

  describe('Error Prevention - React Error #185', () => {
    it('должен безопасно обрабатывать пустой массив токенов', () => {
      const { result } = renderHook(() => useTokensStable());
      
      expect(result.current).toEqual([]);
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('должен безопасно обрабатывать удаление токенов во время рендера', () => {
      // Добавляем несколько токенов
      act(() => {
        useUnifiedBattleStore.getState().addToken({
          name: 'Token 1',
          position: [0, 0, 0],
          hp: 10,
          maxHp: 10,
          ac: 15,
          speed: 6,
          conditions: [],
          isEnemy: false,
          hasMovedThisTurn: false,
        });
        useUnifiedBattleStore.getState().addToken({
          name: 'Token 2',
          position: [1, 0, 1],
          hp: 15,
          maxHp: 15,
          ac: 12,
          speed: 6,
          conditions: [],
          isEnemy: true,
          hasMovedThisTurn: false,
        });
      });

      const { result } = renderHook(() => useTokensStable());
      
      const tokensBefore = result.current;
      expect(tokensBefore.length).toBe(2);
      
      // Удаляем токен
      act(() => {
        useUnifiedBattleStore.getState().removeToken(tokensBefore[0].id);
      });
      
      const tokensAfter = result.current;
      
      expect(tokensAfter.length).toBe(1);
      expect(tokensAfter[0].name).toBe('Token 2');
    });

    it('должен корректно обрабатывать одновременные обновления нескольких токенов', () => {
      // Добавляем токены
      act(() => {
        ['Token 1', 'Token 2', 'Token 3'].forEach(name => {
          useUnifiedBattleStore.getState().addToken({
            name,
            position: [0, 0, 0],
            hp: 10,
            maxHp: 10,
            ac: 15,
            speed: 6,
            conditions: [],
            isEnemy: false,
            hasMovedThisTurn: false,
          });
        });
      });

      const { result } = renderHook(() => useTokensStable());
      const tokens = result.current;
      
      // Обновляем все токены одновременно
      act(() => {
        tokens.forEach(token => {
          useUnifiedBattleStore.getState().updateToken(token.id, {
            hp: token.hp - 5,
          });
        });
      });
      
      const updatedTokens = result.current;
      
      expect(updatedTokens.every(t => t.hp === 5)).toBe(true);
      expect(updatedTokens.length).toBe(3);
    });
  });
});
