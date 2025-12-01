import { useEffect, useState, useRef, useCallback } from 'react';
import { BattleController, type BattleState } from '../core/BattleController';
import { useUserRole } from '@/hooks/use-auth';

export function useBattleController(sessionId: string) {
  const { isDM } = useUserRole();
  const controllerRef = useRef<BattleController | null>(null);
  const [state, setState] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Инициализация контроллера
  useEffect(() => {
    if (!sessionId) return;

    const controller = new BattleController(sessionId, isDM);
    controllerRef.current = controller;

    const unsubscribe = controller.subscribe(() => {
      setState(controller.getState());
    });

    controller.initialize()
      .then(() => {
        setState(controller.getState());
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useBattleController] Ошибка инициализации:', err);
        setError(err);
        setLoading(false);
      });

    return () => {
      unsubscribe();
      controller.destroy();
      controllerRef.current = null;
    };
  }, [sessionId, isDM]);

  // API методы
  const setMap = useCallback(async (file: File) => {
    if (!controllerRef.current) return;
    try {
      await controllerRef.current.setMap(file);
    } catch (err) {
      console.error('[useBattleController] Ошибка загрузки карты:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  const setMapFromUrl = useCallback(async (url: string) => {
    if (!controllerRef.current) return;
    try {
      await controllerRef.current.setMapFromUrl(url);
    } catch (err) {
      console.error('[useBattleController] Ошибка загрузки карты по URL:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  const addToken = useCallback(async (token: any) => {
    if (!controllerRef.current) return;
    try {
      return await controllerRef.current.addToken(token);
    } catch (err) {
      console.error('[useBattleController] Ошибка добавления токена:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  const updateToken = useCallback(async (id: string, updates: any) => {
    if (!controllerRef.current) return;
    try {
      await controllerRef.current.updateToken(id, updates);
    } catch (err) {
      console.error('[useBattleController] Ошибка обновления токена:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  const removeToken = useCallback(async (id: string) => {
    if (!controllerRef.current) return;
    try {
      await controllerRef.current.removeToken(id);
    } catch (err) {
      console.error('[useBattleController] Ошибка удаления токена:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  const setFogCell = useCallback(async (x: number, y: number, revealed: boolean) => {
    if (!controllerRef.current) return;
    try {
      await controllerRef.current.setFogCell(x, y, revealed);
    } catch (err) {
      console.error('[useBattleController] Ошибка обновления тумана:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    state,
    loading,
    error,
    controller: controllerRef.current,
    // API
    setMap,
    setMapFromUrl,
    addToken,
    updateToken,
    removeToken,
    setFogCell,
  };
}
