// src/hooks/useFogSync.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFogStore } from '@/stores/fogStore';

/**
 * Синхронизация тумана войны через Supabase Realtime
 */
export function useFogSync(sessionId: string, mapId: string = 'main-map') {
  useEffect(() => {
    console.log(`🌫️ Initializing fog sync for session ${sessionId}, map ${mapId}`);
    
    // Загружаем начальное состояние тумана войны
    const loadFogState = async () => {
      try {
        const { data, error } = await supabase
          .from('fog_of_war')
          .select('grid_x, grid_y, is_revealed')
          .eq('session_id', sessionId)
          .eq('map_id', mapId);

        if (error) {
          console.error('❌ Error loading fog state:', error);
          return;
        }

        console.log(`📦 Loaded ${data?.length || 0} fog cells from DB`);

        // Всегда инициализируем карту 30x30
        const w = 30, h = 30;
        const fogMap = new Uint8Array(w * h); // 0 = скрыто, 1 = открыто

        if (data && data.length > 0) {
          // Заполняем карту данными из БД
          data.forEach(cell => {
            if (cell.grid_x < w && cell.grid_y < h) {
              const idx = cell.grid_y * w + cell.grid_x;
              fogMap[idx] = cell.is_revealed ? 1 : 0;
            }
          });
          console.log(`✅ Loaded fog state: ${w}x${h}, ${data.filter(c => c.is_revealed).length} revealed cells`);
        } else {
          console.log(`🌫️ Initialized empty fog map (${w}x${h})`);
        }

        useFogStore.getState().setMap(mapId, fogMap, w, h);
      } catch (error) {
        console.error('❌ Exception in loadFogState:', error);
      }
    };

    loadFogState();

    // Подписываемся на изменения в realtime
    const channel = supabase
      .channel(`fog:${sessionId}:${mapId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fog_of_war',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('🔄 Real-time fog change:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const cell = payload.new as any;
            const { maps, size } = useFogStore.getState();
            const map = maps[mapId];
            
            if (!map) {
              console.warn('⚠️ Fog map not initialized for real-time update');
              return;
            }

            if (cell.grid_x >= size.w || cell.grid_y >= size.h) {
              console.warn(`⚠️ Cell coordinates out of bounds: (${cell.grid_x}, ${cell.grid_y}), map size: ${size.w}x${size.h}`);
              return;
            }

            const newMap = new Uint8Array(map);
            const idx = cell.grid_y * size.w + cell.grid_x;
            
            if (idx >= 0 && idx < newMap.length) {
              newMap[idx] = cell.is_revealed ? 1 : 0;
              useFogStore.getState().setMap(mapId, newMap, size.w, size.h);
              console.log(`✅ Real-time update: cell (${cell.grid_x}, ${cell.grid_y}) = ${cell.is_revealed ? 'revealed' : 'hidden'}`);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Fog sync subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to fog updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to fog updates');
        }
      });

    return () => {
      console.log('🌫️ Cleaning up fog sync');
      supabase.removeChannel(channel);
    };
  }, [sessionId, mapId]);
}
