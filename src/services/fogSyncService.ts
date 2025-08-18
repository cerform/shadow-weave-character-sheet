import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { VisibleArea, FogSettings } from '@/stores/fogOfWarStore';

export interface FogSyncData {
  sessionId: string;
  visibleAreas: VisibleArea[];
  fogSettings: FogSettings;
  lastUpdated: string;
  updatedBy: string;
}

class FogSyncService {
  private channel: RealtimeChannel | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private callbacks: {
    onFogUpdate?: (data: FogSyncData) => void;
  } = {};

  async initialize(sessionId: string) {
    this.sessionId = sessionId;
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || 'anonymous';

    // Создаем канал для конкретной сессии
    this.channel = supabase.channel(`fog_sync_${sessionId}`, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    // Подписываемся на события синхронизации тумана
    this.channel
      .on('broadcast', { event: 'fog_update' }, (payload) => {
        if (payload.payload && this.callbacks.onFogUpdate) {
          this.callbacks.onFogUpdate(payload.payload as FogSyncData);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState();
        console.log('👥 Fog sync users:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('🔵 User joined fog sync:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🔴 User left fog sync:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Fog sync channel subscribed');
          
          // Отправляем присутствие
          await this.channel?.track({
            user_id: this.userId,
            session_id: sessionId,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return this.channel;
  }

  // Отправляем обновления тумана войны всем участникам сессии
  async broadcastFogUpdate(visibleAreas: VisibleArea[], fogSettings: FogSettings) {
    if (!this.channel || !this.sessionId || !this.userId) {
      console.warn('❌ Fog sync not initialized');
      return;
    }

    const syncData: FogSyncData = {
      sessionId: this.sessionId,
      visibleAreas,
      fogSettings,
      lastUpdated: new Date().toISOString(),
      updatedBy: this.userId,
    };

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'fog_update',
        payload: syncData,
      });
      
      console.log('📡 Fog update broadcasted:', syncData);
    } catch (error) {
      console.error('❌ Failed to broadcast fog update:', error);
    }
  }

  // Подписываемся на обновления тумана войны
  onFogUpdate(callback: (data: FogSyncData) => void) {
    this.callbacks.onFogUpdate = callback;
  }

  // Отписываемся от канала
  async disconnect() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.sessionId = null;
    this.userId = null;
    this.callbacks = {};
  }

  // Получаем список активных пользователей в сессии
  getActiveUsers() {
    if (!this.channel) return [];
    
    const state = this.channel.presenceState();
    return Object.values(state).flat();
  }
}

export const fogSyncService = new FogSyncService();