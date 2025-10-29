import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';

/**
 * Хук для синхронизации карты боя между мастером и игроками
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
          .single();

        if (error) {
          console.error('❌ [PLAYER] Ошибка загрузки URL карты:', error);
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
    const channel = supabase
      .channel(`map-sync-player-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
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
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [PLAYER] Статус подписки на карту:', status);
      });

    return () => {
      console.log('🔕 [PLAYER] Отписка от изменений карты');
      supabase.removeChannel(channel);
    };
  }, [sessionId, isDM, setMapImageUrl, toast]);

  // Мастер сохраняет URL карты в game_sessions
  const { mapImageUrl } = useEnhancedBattleStore();
  
  // При смене сессии СНАЧАЛА очищаем карту, затем загружаем карту текущей сессии
  useEffect(() => {
    if (!isDM) return;
    
    if (!sessionId) {
      // Очищаем карту если нет сессии
      console.log('🗺️ [DM] Нет sessionId - очищаем карту');
      setMapImageUrl(null);
      return;
    }

    // КРИТИЧНО: Сразу очищаем карту при смене сессии
    console.log('🗺️ [DM] Смена сессии - очищаем карту:', sessionId);
    setMapImageUrl(null);

    // Загружаем карту для новой сессии БЕЗ setTimeout
    const loadCurrentSessionMap = async () => {
      try {
        console.log('🗺️ [DM] Загрузка карты для сессии:', sessionId);
        
        const { data, error } = await supabase
          .from('game_sessions')
          .select('current_map_url')
          .eq('id', sessionId)
          .single();

        if (error) {
          console.error('❌ [DM] Ошибка загрузки карты сессии:', error);
          return;
        }

        // Устанавливаем карту сессии ТОЛЬКО если она есть
        if (data?.current_map_url) {
          console.log('✅ [DM] Загружена карта сессии:', data.current_map_url);
          setMapImageUrl(data.current_map_url);
        } else {
          console.log('ℹ️ [DM] Новая сессия без карты - карта остается пустой');
        }
      } catch (error) {
        console.error('❌ [DM] Ошибка при загрузке карты сессии:', error);
      }
    };

    loadCurrentSessionMap();
  }, [isDM, sessionId, setMapImageUrl]);

  // Синхронизируем изменения карты в БД
  useEffect(() => {
    if (!isDM || !sessionId || !mapImageUrl) return;

    const syncMapUrl = async () => {
      try {
        console.log('📤 [DM] Синхронизация URL карты в game_sessions:', {
          sessionId,
          mapImageUrl,
        });
        
        const { data, error } = await supabase
          .from('game_sessions')
          .update({ 
            current_map_url: mapImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select();

        if (error) {
          console.error('❌ [DM] Ошибка синхронизации URL карты:', error);
        } else {
          console.log('✅ [DM] URL карты синхронизирован в game_sessions:', data);
        }
      } catch (error) {
        console.error('❌ [DM] Исключение при синхронизации URL карты:', error);
      }
    };

    // Небольшая задержка чтобы не спамить при изменениях
    const timeoutId = setTimeout(syncMapUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [isDM, sessionId, mapImageUrl]);
};
