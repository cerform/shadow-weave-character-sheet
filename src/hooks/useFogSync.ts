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
          console.error('Error loading fog state:', error);
          return;
        }

        if (!data || data.length === 0) {
          // Инициализируем пустую карту тумана (30x30)
          const w = 30, h = 30;
          useFogStore.getState().setMap(mapId, new Uint8Array(w * h), w, h);
          console.log('🌫️ Initialized empty fog map');
          return;
        }

        // Находим границы карты
        let maxX = 0, maxY = 0;
        data.forEach(cell => {
          if (cell.grid_x > maxX) maxX = cell.grid_x;
          if (cell.grid_y > maxY) maxY = cell.grid_y;
        });

        const w = maxX + 1;
        const h = maxY + 1;
        const fogMap = new Uint8Array(w * h); // 0 = скрыто, 1 = открыто

        // Заполняем карту
        data.forEach(cell => {
          if (cell.is_revealed) {
            fogMap[cell.grid_y * w + cell.grid_x] = 1;
          }
        });

        useFogStore.getState().setMap(mapId, fogMap, w, h);
        console.log(`🌫️ Loaded fog state: ${w}x${h}, ${data.filter(c => c.is_revealed).length} revealed cells`);
      } catch (error) {
        console.error('Error in loadFogState:', error);
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
          console.log('🌫️ Fog change received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const cell = payload.new as any;
            const { maps, size } = useFogStore.getState();
            const map = maps[mapId];
            
            if (!map) {
              console.warn('Fog map not initialized');
              return;
            }

            const newMap = new Uint8Array(map);
            const idx = cell.grid_y * size.w + cell.grid_x;
            
            if (idx >= 0 && idx < newMap.length) {
              newMap[idx] = cell.is_revealed ? 1 : 0;
              useFogStore.getState().setMap(mapId, newMap, size.w, size.h);
              console.log(`🌫️ Updated cell (${cell.grid_x}, ${cell.grid_y}): ${cell.is_revealed ? 'revealed' : 'hidden'}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🌫️ Cleaning up fog sync');
      supabase.removeChannel(channel);
    };
  }, [sessionId, mapId]);
}
