import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/services/socket';

/**
 * Хук для синхронизации токенов боя с Supabase
 * Загружает токены из БД и подписывается на изменения в реальном времени
 * С батчингом обновлений для производительности
 */
export const useBattleTokensSync = (sessionId: string) => {
  const { setTokens, updateToken, addToken, removeToken } = useEnhancedBattleStore();
  const { toast } = useToast();
  
  // Очередь для батчинга обновлений
  const pendingUpdates = useRef<Map<string, Partial<EnhancedToken>>>(new Map());
  const updateScheduled = useRef(false);

  
  // Функция для flush очереди обновлений
  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size === 0) return;
    
    // Применяем все обновления за раз
    pendingUpdates.current.forEach((updates, tokenId) => {
      updateToken(tokenId, updates);
    });
    
    pendingUpdates.current.clear();
    updateScheduled.current = false;
  }, [updateToken]);
  
  // Функция для планирования обновления через RAF
  const scheduleUpdate = useCallback((tokenId: string, updates: Partial<EnhancedToken>) => {
    pendingUpdates.current.set(tokenId, {
      ...pendingUpdates.current.get(tokenId),
      ...updates
    });
    
    if (!updateScheduled.current) {
      updateScheduled.current = true;
      requestAnimationFrame(flushUpdates);
    }
  }, [flushUpdates]);

  // Загружаем токены при монтировании
  useEffect(() => {
    if (!sessionId) return;

    const loadTokens = async () => {
      try {
        console.log('📍 Загрузка токенов для сессии:', sessionId);
        
        const { data: tokensData, error } = await supabase
          .from('battle_tokens')
          .select('*')
          .eq('session_id', sessionId);

        if (error) {
          console.error('Ошибка загрузки токенов:', error);
          setTokens([]); // Очищаем токены при ошибке
          return;
        }

        if (tokensData && tokensData.length > 0) {
          // Преобразуем токены из БД в формат EnhancedToken
          const mappedTokens: EnhancedToken[] = tokensData.map(token => ({
            id: token.id,
            name: token.name || 'Безымянный',
            hp: token.current_hp || 0,
            maxHp: token.max_hp || 0,
            ac: token.armor_class || 10,
            position: [
              token.position_x || 0,
              0, // Y координата для 2D/3D
              token.position_y || 0 // Z координата для 3D
            ] as [number, number, number],
            conditions: Array.isArray(token.conditions) ? token.conditions as string[] : [],
            isEnemy: token.token_type === 'enemy',
            isVisible: !token.is_hidden_from_players && token.is_visible !== false,
            avatarUrl: token.image_url || undefined,
            size: token.size || 1,
            speed: 6, // По умолчанию
            hasMovedThisTurn: false,
            color: token.color || undefined,
            owner_id: token.owner_id || undefined,
            summoned_by: token.summoned_by || undefined,
            is_summoned: token.is_summoned || false,
          }));

          console.log('✅ Загружено токенов:', mappedTokens.length);
          setTokens(mappedTokens);
        } else {
          console.log('ℹ️ Токены не найдены для сессии, очищаем');
          setTokens([]); // Очищаем токены если их нет
        }
      } catch (error) {
        console.error('Ошибка при загрузке токенов:', error);
        setTokens([]); // Очищаем токены при ошибке
      }
    };

    loadTokens();
  }, [sessionId]); // Убрали setTokens из зависимостей

  // Подписываемся на изменения в реальном времени
  useEffect(() => {
    if (!sessionId) return;

    console.log('🔔 Подписка на изменения токенов для сессии:', sessionId);

    const channel = supabase
      .channel(`battle-tokens-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('➕ Новый токен:', payload.new);
          const token = payload.new;
          
          const newToken: EnhancedToken = {
            id: token.id,
            name: token.name || 'Безымянный',
            hp: token.current_hp || 0,
            maxHp: token.max_hp || 0,
            ac: token.armor_class || 10,
            position: [
              token.position_x || 0,
              0,
              token.position_y || 0
            ] as [number, number, number],
            conditions: Array.isArray(token.conditions) ? token.conditions as string[] : [],
            isEnemy: token.token_type === 'enemy',
            isVisible: !token.is_hidden_from_players && token.is_visible !== false,
            avatarUrl: token.image_url || undefined,
            size: token.size || 1,
            speed: 6,
            hasMovedThisTurn: false,
            color: token.color || undefined,
            owner_id: token.owner_id || undefined,
            summoned_by: token.summoned_by || undefined,
            is_summoned: token.is_summoned || false,
          };

          addToken(newToken);
          
          toast({
            title: "Новый токен",
            description: `${newToken.name} добавлен на карту`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('✏️ Обновление токена:', payload.new);
          const token = payload.new;
          
          // Используем батчинг вместо немедленного обновления
          scheduleUpdate(token.id, {
            name: token.name,
            hp: token.current_hp,
            maxHp: token.max_hp,
            ac: token.armor_class,
            position: [
              token.position_x,
              0,
              token.position_y
            ] as [number, number, number],
            conditions: Array.isArray(token.conditions) ? token.conditions as string[] : [],
            isEnemy: token.token_type === 'enemy',
            isVisible: !token.is_hidden_from_players && token.is_visible !== false,
            avatarUrl: token.image_url,
            size: token.size,
            color: token.color,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('🗑️ Удаление токена:', payload.old);
          removeToken(payload.old.id);
          
          toast({
            title: "Токен удален",
            description: `${payload.old.name || 'Токен'} удален с карты`,
          });
        }
      )
      .subscribe();
      
    // --- Добавляем прослушивание Socket.io для мгновенных обновлений ---
    const handleBattleEvent = (data: any) => {
      console.log('🔌 Socket battle event:', data);
      
      if (data.type === 'token_move' && data.tokenId) {
        scheduleUpdate(data.tokenId, {
          position: [data.x, 0, data.y] as [number, number, number]
        });
      } else if (data.type === 'token_add' && data.token) {
        const token = data.token;
        addToken({
          id: token.id,
          name: token.name,
          hp: token.current_hp,
          maxHp: token.max_hp,
          position: [token.position_x, 0, token.position_y],
          isEnemy: token.token_type === 'enemy',
          avatarUrl: token.image_url,
          size: token.size || 1
        } as EnhancedToken);
      } else if (data.type === 'token_delete') {
        removeToken(data.tokenId);
      }
    };

    socketService.onBattleEvent(handleBattleEvent);
    socketService.connect(); // Убеждаемся что сокет активен

    return () => {
      console.log('🔕 Отписка от изменений токенов');
      // Flush оставшиеся обновления перед размонтированием
      flushUpdates();
      supabase.removeChannel(channel);
      socketService.removeBattleListener(handleBattleEvent);
    };

    return () => {
      console.log('🔕 Отписка от изменений токенов');
      // Flush оставшиеся обновления перед размонтированием
      flushUpdates();
      supabase.removeChannel(channel);
    };
  }, [sessionId, scheduleUpdate, flushUpdates]); // Добавили scheduleUpdate и flushUpdates
};
