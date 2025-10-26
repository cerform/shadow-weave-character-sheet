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

  // Игроки получают URL карты из dm_sessions
  useEffect(() => {
    if (isDM || !sessionId) return;

    const loadMapUrl = async () => {
      try {
        console.log('🗺️ Загрузка URL карты для сессии:', sessionId);
        
        const { data, error } = await supabase
          .from('dm_sessions')
          .select('current_map_url')
          .eq('id', sessionId)
          .single();

        if (error) {
          console.error('Ошибка загрузки URL карты:', error);
          return;
        }

        if (data?.current_map_url) {
          console.log('✅ URL карты загружен:', data.current_map_url);
          setMapImageUrl(data.current_map_url);
        }
      } catch (error) {
        console.error('Ошибка при загрузке URL карты:', error);
      }
    };

    loadMapUrl();

    // Подписываемся на изменения URL карты
    const channel = supabase
      .channel(`map-sync-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dm_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('🗺️ Обновление карты:', payload.new);
          const newMapUrl = (payload.new as any).current_map_url;
          
          if (newMapUrl) {
            setMapImageUrl(newMapUrl);
            toast({
              title: "Карта обновлена",
              description: "Мастер сменил карту боя",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Отписка от изменений карты');
      supabase.removeChannel(channel);
    };
  }, [sessionId, isDM, setMapImageUrl, toast]);

  // Мастер сохраняет URL карты в dm_sessions
  const { mapImageUrl } = useEnhancedBattleStore();
  
  useEffect(() => {
    if (!isDM || !sessionId || !mapImageUrl) return;

    const syncMapUrl = async () => {
      try {
        console.log('📤 Синхронизация URL карты:', mapImageUrl);
        
        const { error } = await supabase
          .from('dm_sessions')
          .update({ 
            current_map_url: mapImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Ошибка синхронизации URL карты:', error);
        } else {
          console.log('✅ URL карты синхронизирован');
        }
      } catch (error) {
        console.error('Ошибка при синхронизации URL карты:', error);
      }
    };

    // Небольшая задержка чтобы не спамить при изменениях
    const timeoutId = setTimeout(syncMapUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [isDM, sessionId, mapImageUrl]);
};
