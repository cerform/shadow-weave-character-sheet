import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';
import { realtimeManager } from '@/services/RealtimeService';

/**
 * Хук для синхронизации карты боя между мастером и игроками
 * ДЛЯ ИГРОКОВ: загружает URL карты из game_sessions
 * ДЛЯ МАСТЕРА: НЕ используется, так как мастер управляет картой через useBattleSession
 */
export const useBattleMapSync = (sessionId: string, isDM: boolean) => {
  const { setMapImageUrl } = useEnhancedBattleStore();
  const { toast } = useToast();

  // Игроки получают URL карты из game_sessions
  useEffect(() => {
    if (isDM || !sessionId) return;

    const loadMapUrl = async () => {
      try {
        console.log('🗺️ [PLAYER] Загрузка URL карты для сессии:', sessionId);
        
        const { data, error } = await supabase
          .from('game_sessions')
          .select('current_map_url, updated_at')
          .eq('id', sessionId)
          .maybeSingle();

        if (error) {
          console.error('❌ [PLAYER] Ошибка загрузки URL карты:', error);
          setMapImageUrl(null);
          return;
        }

        if (!data) {
          console.log('ℹ️ [PLAYER] Сессия не найдена');
          setMapImageUrl(null);
          return;
        }

        console.log('📦 [PLAYER] Получены данные сессии:', data);

        // Устанавливаем карту только если она есть
        if (data?.current_map_url) {
          console.log('✅ [PLAYER] URL карты установлен:', data.current_map_url);
          setMapImageUrl(data.current_map_url);
        } else {
          console.log('ℹ️ [PLAYER] У сессии нет карты (current_map_url пустой)');
          setMapImageUrl(null);
        }
      } catch (error) {
        console.error('❌ [PLAYER] Исключение при загрузке URL карты:', error);
        setMapImageUrl(null);
      }
    };

    loadMapUrl();

    // Подписываемся на изменения URL карты в game_sessions
    console.log('📡 [PLAYER] Подписка на изменения карты для сессии:', sessionId);
    
    realtimeManager.connectSession(sessionId).catch(console.error);

    const unsub = realtimeManager.onPgChange(sessionId, 'game_sessions', 'UPDATE', (payload) => {
      console.log('🔄 [PLAYER] Real-time обновление game_sessions:', payload);
      const newMapUrl = (payload.new as any).current_map_url;
      
      console.log('🗺️ [PLAYER] Новый URL карты из real-time:', newMapUrl);
      
      if (newMapUrl) {
        console.log('✅ [PLAYER] Применяем новую карту:', newMapUrl);
        setMapImageUrl(newMapUrl);
        toast({
          title: "Карта обновлена",
          description: "Мастер сменил карту боя",
        });
      } else {
        console.log('ℹ️ [PLAYER] Обновление без карты (current_map_url пустой)');
        setMapImageUrl(null);
      }
    });

    return () => {
      console.log('🔕 [PLAYER] Отписка от изменений карты');
      unsub();
    };
  }, [sessionId, isDM]); // Убрали setMapImageUrl и toast из зависимостей

  // ДЛЯ МАСТЕРА: управление картой происходит через useBattleSession + currentMap
  // Этот хук для мастера НЕ используется
};
