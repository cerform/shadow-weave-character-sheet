// src/hooks/useFogSync.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFogStore } from '@/stores/fogStore';

/**
 * Синхронизация тумана войны через Supabase Realtime
 */
export function useFogSync(sessionId: string, mapId: string = 'main-map') {
  useEffect(() => {
    if (!sessionId || sessionId === 'default-session' || sessionId === 'current-session') {
      console.warn('⚠️ Invalid sessionId for fog sync:', sessionId);
      return;
    }
    
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

        // Определяем размер сетки динамически на основе данных или используем максимальный размер
        let maxX = 0;
        let maxY = 0;
        
        if (data && data.length > 0) {
          data.forEach(cell => {
            if (cell.grid_x > maxX) maxX = cell.grid_x;
            if (cell.grid_y > maxY) maxY = cell.grid_y;
          });
        }
        
        // Увеличиваем на 1 для размера и добавляем запас
        const w = Math.max(maxX + 1, 50);
        const h = Math.max(maxY + 1, 50);
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
            
            // Проверяем что это наша карта
            if (cell.map_id !== mapId) {
              console.log(`⏭️ Skipping fog update for different map: ${cell.map_id}`);
              return;
            }
            
            const { maps, size } = useFogStore.getState();
            let map = maps[mapId];
            
            if (!map) {
              console.warn('⚠️ Fog map not initialized, creating new map');
              // Создаем карту если ее еще нет
              const w = Math.max(cell.grid_x + 1, 50);
              const h = Math.max(cell.grid_y + 1, 50);
              map = new Uint8Array(w * h);
              useFogStore.getState().setMap(mapId, map, w, h);
            }

            // Если координаты выходят за границы, расширяем карту
            if (cell.grid_x >= size.w || cell.grid_y >= size.h) {
              const newW = Math.max(size.w, cell.grid_x + 10);
              const newH = Math.max(size.h, cell.grid_y + 10);
              const newMap = new Uint8Array(newW * newH);
              
              // Копируем старые данные
              for (let y = 0; y < size.h; y++) {
                for (let x = 0; x < size.w; x++) {
                  newMap[y * newW + x] = map[y * size.w + x];
                }
              }
              
              map = newMap;
              console.log(`📏 Expanded fog map to ${newW}x${newH}`);
            } else {
              map = new Uint8Array(map);
            }

            const idx = cell.grid_y * (cell.grid_x >= size.w ? Math.max(size.w, cell.grid_x + 10) : size.w) + cell.grid_x;
            
            if (idx >= 0 && idx < map.length) {
              map[idx] = cell.is_revealed ? 1 : 0;
              useFogStore.getState().setMap(
                mapId, 
                map, 
                cell.grid_x >= size.w ? Math.max(size.w, cell.grid_x + 10) : size.w,
                cell.grid_y >= size.h ? Math.max(size.h, cell.grid_y + 10) : size.h
              );
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
