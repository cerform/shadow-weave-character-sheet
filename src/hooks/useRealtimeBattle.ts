// Хук для синхронизации боевой карты в реальном времени через Supabase
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export interface BattleEvent {
  type: 'fog_update' | 'token_move' | 'spawn_point_add' | 'combat_start' | 'initiative_roll';
  data: any;
  senderId: string;
  timestamp: number;
}

export const useRealtimeBattle = (sessionId: string | null) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { isDM } = useUnifiedBattleStore();
  const { 
    fogGrid, 
    spawnPoints, 
    lastUpdated: fogLastUpdated,
    initializeFog,
    revealArea,
    hideArea,
    addSpawnPoint
  } = useFogOfWarStore();

  // Подключение к каналу реального времени
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`battle_session_${sessionId}`, {
      config: {
        presence: { key: sessionId }
      }
    });

    // Отслеживание присутствия пользователей
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('👥 Участники сессии:', Object.keys(state));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 Присоединился:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 Покинул:', key, leftPresences);
      });

    // Обработка событий боя
    channel.on('broadcast', { event: 'battle_event' }, (payload: { payload: BattleEvent }) => {
      const event = payload.payload;
      
      // Не обрабатываем собственные события (получаем ID синхронно)
      supabase.auth.getUser().then(u => {
        if (event.senderId === u.data.user?.id) return;
        handleBattleEvent(event);
      });
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Подключен к боевой сессии:', sessionId);
        
        // Отправляем свое присутствие
        await channel.track({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: isDM ? 'dm' : 'player',
          online_at: new Date().toISOString()
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [sessionId, isDM]);

  // Обработка входящих событий
  const handleBattleEvent = (event: BattleEvent) => {
    console.log('📡 Получено событие:', event.type, event.data);

    switch (event.type) {
      case 'fog_update':
        if (event.data.action === 'reveal') {
          revealArea(event.data.x, event.data.y, event.data.radius);
        } else if (event.data.action === 'hide') {
          hideArea(event.data.x, event.data.y, event.data.radius);
        }
        break;

      case 'spawn_point_add':
        addSpawnPoint(event.data.x, event.data.y, event.data.name);
        break;

      case 'token_move':
        // Обновляем позицию токена
        useUnifiedBattleStore.getState().updateToken(event.data.tokenId, {
          position: event.data.position
        });
        break;

      case 'combat_start':
        console.log('⚔️ Начался бой!', event.data);
        break;

      case 'initiative_roll':
        console.log('🎲 Бросок инициативы:', event.data);
        break;
    }
  };

  // Отправка событий другим участникам
  const sendBattleEvent = async (type: BattleEvent['type'], data: any) => {
    if (!channelRef.current) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const event: BattleEvent = {
      type,
      data,
      senderId: user.data.user.id,
      timestamp: Date.now()
    };

    await channelRef.current.send({
      type: 'broadcast',
      event: 'battle_event',
      payload: event
    });

    console.log('📤 Отправлено событие:', type, data);
  };

  // Синхронизация тумана войны
  useEffect(() => {
    if (!isDM || !channelRef.current) return;

    // Отправляем обновления тумана при изменениях
    const timeoutId = setTimeout(() => {
      // Можно отправить сжатую версию сетки тумана
      // sendBattleEvent('fog_sync', { fogGrid: compressFogGrid(fogGrid) });
    }, 1000); // Дебаунс для избежания спама

    return () => clearTimeout(timeoutId);
  }, [fogLastUpdated, isDM]);

  return {
    sendBattleEvent,
    isConnected: !!channelRef.current
  };
};

// Утилита для сжатия сетки тумана (опционально)
function compressFogGrid(grid: number[][]) {
  // Простое RLE сжатие или другой алгоритм
  return grid.map(row => row.join('')).join('|');
}

function decompressFogGrid(compressed: string): number[][] {
  return compressed.split('|').map(row => 
    row.split('').map(cell => parseInt(cell))
  );
}