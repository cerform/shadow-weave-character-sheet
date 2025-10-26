import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';

/**
 * Хук для синхронизации токенов боя с Supabase
 * Загружает токены из БД и подписывается на изменения в реальном времени
 */
export const useBattleTokensSync = (sessionId: string) => {
  const { setTokens, updateToken, addToken, removeToken } = useEnhancedBattleStore();
  const { toast } = useToast();

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
          }));

          console.log('✅ Загружено токенов:', mappedTokens.length);
          setTokens(mappedTokens);
        } else {
          console.log('ℹ️ Токены не найдены для сессии');
        }
      } catch (error) {
        console.error('Ошибка при загрузке токенов:', error);
      }
    };

    loadTokens();
  }, [sessionId, setTokens]);

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
          
          updateToken(token.id, {
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

    return () => {
      console.log('🔕 Отписка от изменений токенов');
      supabase.removeChannel(channel);
    };
  }, [sessionId, addToken, updateToken, removeToken, toast]);
};
