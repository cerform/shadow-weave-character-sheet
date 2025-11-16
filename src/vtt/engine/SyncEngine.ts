// Supabase Sync Engine for Fog of War
import { supabase } from '@/integrations/supabase/client';
import type { VTTFogCell } from '../types/fog';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class FogSyncEngine {
  private sessionId: string;
  private mapId: string;
  private isDM: boolean;
  
  private pendingChanges: Map<string, VTTFogCell> = new Map();
  private flushInterval: number | null = null;
  private subscription: RealtimeChannel | null = null;
  
  private onCellsChanged?: (cells: VTTFogCell[]) => void;
  
  constructor(sessionId: string, mapId: string, isDM: boolean) {
    this.sessionId = sessionId;
    this.mapId = mapId;
    this.isDM = isDM;
  }

  async loadInitialFog(): Promise<VTTFogCell[]> {
    console.log('[FogSyncEngine] Loading initial fog data...');
    
    const { data, error } = await supabase
      .from('fog_of_war')
      .select('grid_x, grid_y, is_revealed')
      .eq('session_id', this.sessionId)
      .eq('map_id', this.mapId);
    
    if (error) {
      console.error('[FogSyncEngine] Error loading fog:', error);
      return [];
    }
    
    const cells: VTTFogCell[] = (data || []).map(row => ({
      x: row.grid_x,
      y: row.grid_y,
      revealed: row.is_revealed ? 255 : 0
    }));
    
    console.log(`[FogSyncEngine] Loaded ${cells.length} fog cells`);
    return cells;
  }

  startBatching(intervalMs: number = 2000): void {
    if (!this.isDM) {
      console.warn('[FogSyncEngine] Only DM can batch fog changes');
      return;
    }
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.flushInterval = window.setInterval(() => {
      this.flushChanges();
    }, intervalMs);
    
    console.log(`[FogSyncEngine] Started batching with ${intervalMs}ms interval`);
  }

  queueChange(cell: VTTFogCell): void {
    const key = `${cell.x},${cell.y}`;
    this.pendingChanges.set(key, cell);
  }

  async flushChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return;
    
    const cells = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();
    
    console.log(`[FogSyncEngine] Flushing ${cells.length} fog changes...`);
    
    const rows = cells.map(cell => ({
      session_id: this.sessionId,
      map_id: this.mapId,
      grid_x: cell.x,
      grid_y: cell.y,
      is_revealed: cell.revealed > 127 // Threshold at 50%
    }));
    
    const { error } = await supabase
      .from('fog_of_war')
      .upsert(rows, {
        onConflict: 'session_id,map_id,grid_x,grid_y'
      });
    
    if (error) {
      console.error('[FogSyncEngine] Error flushing changes:', error);
    } else {
      console.log(`[FogSyncEngine] Successfully flushed ${cells.length} changes`);
    }
  }

  subscribeToChanges(callback: (cells: VTTFogCell[]) => void): void {
    this.onCellsChanged = callback;
    
    this.subscription = supabase
      .channel(`fog-${this.sessionId}-${this.mapId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fog_of_war',
          filter: `session_id=eq.${this.sessionId},map_id=eq.${this.mapId}`
        },
        (payload) => {
          console.log('[FogSyncEngine] Received fog change:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            const cell: VTTFogCell = {
              x: row.grid_x,
              y: row.grid_y,
              revealed: row.is_revealed ? 255 : 0
            };
            
            this.onCellsChanged?.([cell]);
          }
        }
      )
      .subscribe();
    
    console.log('[FogSyncEngine] Subscribed to realtime fog changes');
  }

  dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    this.pendingChanges.clear();
    
    console.log('[FogSyncEngine] Disposed');
  }
}
