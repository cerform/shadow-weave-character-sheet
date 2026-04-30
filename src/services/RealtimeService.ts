import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 
  | 'game_sessions' 
  | 'session_players' 
  | 'session_messages' 
  | 'battle_tokens' 
  | 'initiative_tracker' 
  | 'battle_maps' 
  | 'fog_of_war' 
  | 'map_entities'
  | 'battle_entities';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionCallback {
  table: TableName;
  event: EventType;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

interface PresenceCallback {
  event: 'sync' | 'join' | 'leave';
  callback: (payload: any) => void;
}

interface BroadcastCallback {
  event: string;
  callback: (payload: any) => void;
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  
  // Callbacks registry
  private pgCallbacks: Map<string, Set<SubscriptionCallback>> = new Map();
  private presenceCallbacks: Map<string, Set<PresenceCallback>> = new Map();
  private broadcastCallbacks: Map<string, Set<BroadcastCallback>> = new Map();

  /**
   * Connects to a unified session channel. Ensures only ONE channel is created per session.
   */
  public async connectSession(sessionId: string, userId?: string, playerName?: string, characterId?: string): Promise<RealtimeChannel> {
    if (this.channels.has(sessionId)) {
      const existing = this.channels.get(sessionId)!;
      if (existing.state === 'joined') {
        return existing;
      } else {
        // If not joined, remove and recreate
        await supabase.removeChannel(existing);
        this.channels.delete(sessionId);
      }
    }

    console.log(`🔌 [RealtimeManager] Creating unified channel for session: ${sessionId}`);

    const channel = supabase.channel(`unified-session-${sessionId}`, {
      config: {
        presence: { key: userId || 'anonymous' },
        broadcast: { self: true },
      },
    });

    // --- BIND POSTGRES CHANGES ---
    const bindPg = (table: TableName, filter: string) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload) => {
        this.dispatchPgEvent(sessionId, table, payload);
      });
    };

    bindPg('game_sessions', `id=eq.${sessionId}`);
    bindPg('session_players', `session_id=eq.${sessionId}`);
    bindPg('session_messages', `session_id=eq.${sessionId}`);
    bindPg('battle_tokens', `session_id=eq.${sessionId}`);
    bindPg('initiative_tracker', `session_id=eq.${sessionId}`);
    bindPg('battle_maps', `session_id=eq.${sessionId}`);
    bindPg('fog_of_war', `session_id=eq.${sessionId}`);
    bindPg('map_entities', `session_id=eq.${sessionId}`);
    bindPg('battle_entities', `session_id=eq.${sessionId}`);

    // --- BIND PRESENCE ---
    channel.on('presence', { event: 'sync' }, () => {
      this.dispatchPresenceEvent(sessionId, 'sync', channel.presenceState());
    });
    channel.on('presence', { event: 'join' }, (payload) => {
      this.dispatchPresenceEvent(sessionId, 'join', payload);
    });
    channel.on('presence', { event: 'leave' }, (payload) => {
      this.dispatchPresenceEvent(sessionId, 'leave', payload);
    });

    // --- BIND BROADCAST ---
    channel.on('broadcast', { event: 'session_update' }, (payload) => {
      this.dispatchBroadcastEvent(sessionId, 'session_update', payload);
    });
    channel.on('broadcast', { event: 'mouse_move' }, (payload) => {
      this.dispatchBroadcastEvent(sessionId, 'mouse_move', payload);
    });

    // --- SUBSCRIBE ---
    channel.subscribe(async (status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ [RealtimeManager] Subscribed to ${sessionId}`);
        if (userId) {
          await channel.track({
            user_id: userId,
            player_name: playerName,
            character_id: characterId,
            online_at: new Date().toISOString(),
          });
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ [RealtimeManager] Channel error for ${sessionId}:`, err);
      } else if (status === 'TIMED_OUT') {
        console.error(`❌ [RealtimeManager] Timed out for ${sessionId}`);
      } else if (status === 'CLOSED') {
        console.log(`⚠️ [RealtimeManager] Channel closed for ${sessionId}`);
      }
    });

    this.channels.set(sessionId, channel);
    return channel;
  }

  public async disconnectSession(sessionId: string) {
    const channel = this.channels.get(sessionId);
    if (channel) {
      console.log(`🔌 [RealtimeManager] Disconnecting session: ${sessionId}`);
      await supabase.removeChannel(channel);
      this.channels.delete(sessionId);
    }
  }

  // --- REGISTRATION METHODS ---

  public onPgChange(sessionId: string, table: TableName, event: EventType, callback: (payload: RealtimePostgresChangesPayload<any>) => void) {
    if (!this.pgCallbacks.has(sessionId)) this.pgCallbacks.set(sessionId, new Set());
    const sub: SubscriptionCallback = { table, event, callback };
    this.pgCallbacks.get(sessionId)!.add(sub);
    return () => this.pgCallbacks.get(sessionId)?.delete(sub);
  }

  public onPresence(sessionId: string, event: 'sync' | 'join' | 'leave', callback: (payload: any) => void) {
    if (!this.presenceCallbacks.has(sessionId)) this.presenceCallbacks.set(sessionId, new Set());
    const sub: PresenceCallback = { event, callback };
    this.presenceCallbacks.get(sessionId)!.add(sub);
    return () => this.presenceCallbacks.get(sessionId)?.delete(sub);
  }

  public onBroadcast(sessionId: string, event: string, callback: (payload: any) => void) {
    if (!this.broadcastCallbacks.has(sessionId)) this.broadcastCallbacks.set(sessionId, new Set());
    const sub: BroadcastCallback = { event, callback };
    this.broadcastCallbacks.get(sessionId)!.add(sub);
    return () => this.broadcastCallbacks.get(sessionId)?.delete(sub);
  }

  public async sendBroadcast(sessionId: string, event: string, payload: any) {
    const channel = this.channels.get(sessionId);
    if (channel && channel.state === 'joined') {
      return channel.send({ type: 'broadcast', event, payload });
    }
    return 'error';
  }

  // --- DISPATCHERS ---

  private dispatchPgEvent(sessionId: string, table: TableName, payload: RealtimePostgresChangesPayload<any>) {
    const cbs = this.pgCallbacks.get(sessionId);
    if (!cbs) return;
    cbs.forEach(sub => {
      if (sub.table === table && (sub.event === '*' || sub.event === payload.eventType)) {
        sub.callback(payload);
      }
    });
  }

  private dispatchPresenceEvent(sessionId: string, event: 'sync' | 'join' | 'leave', payload: any) {
    const cbs = this.presenceCallbacks.get(sessionId);
    if (!cbs) return;
    cbs.forEach(sub => {
      if (sub.event === event) {
        sub.callback(payload);
      }
    });
  }

  private dispatchBroadcastEvent(sessionId: string, event: string, payload: any) {
    const cbs = this.broadcastCallbacks.get(sessionId);
    if (!cbs) return;
    cbs.forEach(sub => {
      if (sub.event === event) {
        sub.callback(payload);
      }
    });
  }
}

export const realtimeManager = new RealtimeManager();
