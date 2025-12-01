/**
 * Централизованный контроллер боевой системы
 * Управляет картой, токенами, туманом войны и синхронизацией
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface BattleState {
  sessionId: string;
  mapUrl: string | null;
  mapSize: { width: number; height: number };
  tokens: BattleToken[];
  fogGrid: number[][];
  isDM: boolean;
}

export interface BattleToken {
  id: string;
  name: string;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  ac: number;
  size: number;
  color?: string;
  imageUrl?: string;
  isVisible: boolean;
  ownerId?: string;
}

export class BattleController {
  private sessionId: string;
  private isDM: boolean;
  private channels: RealtimeChannel[] = [];
  private listeners: Set<() => void> = new Set();
  
  private state: BattleState;

  constructor(sessionId: string, isDM: boolean) {
    this.sessionId = sessionId;
    this.isDM = isDM;
    this.state = {
      sessionId,
      mapUrl: null,
      mapSize: { width: 2000, height: 2000 },
      tokens: [],
      fogGrid: [],
      isDM,
    };
  }

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  getState(): BattleState {
    return { ...this.state };
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach(fn => fn());
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  async initialize(): Promise<void> {
    console.log('[BattleController] Инициализация...');
    
    try {
      await Promise.all([
        this.loadMap(),
        this.loadTokens(),
        this.loadFogOfWar(),
      ]);

      this.setupRealtimeSync();
      
      console.log('[BattleController] Инициализация завершена');
    } catch (error) {
      console.error('[BattleController] Ошибка инициализации:', error);
      throw error;
    }
  }

  // ========================================
  // MAP MANAGEMENT
  // ========================================

  private async loadMap(): Promise<void> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('current_map_url')
      .eq('id', this.sessionId)
      .single();

    if (error) {
      console.error('[BattleController] Ошибка загрузки карты:', error);
      return;
    }

    if (data?.current_map_url) {
      this.state.mapUrl = data.current_map_url;
      
      // Загружаем размеры карты
      const mapData = await this.getImageDimensions(data.current_map_url);
      if (mapData) {
        this.state.mapSize = mapData;
      }
      
      this.emit();
    }
  }

  private async getImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async setMap(file: File): Promise<void> {
    if (!this.isDM) {
      throw new Error('Только DM может менять карту');
    }

    console.log('[BattleController] Загрузка новой карты...');

    // Загружаем файл в Storage
    const fileName = `${this.sessionId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('battle-maps')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('[BattleController] Ошибка загрузки файла:', uploadError);
      throw uploadError;
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('battle-maps')
      .getPublicUrl(fileName);

    const mapUrl = urlData.publicUrl;

    // Получаем размеры
    const dimensions = await this.getImageDimensions(mapUrl);

    // Сохраняем в battle_maps
    const { error: mapError } = await supabase
      .from('battle_maps')
      .upsert({
        session_id: this.sessionId,
        name: file.name,
        file_url: mapUrl,
        file_path: fileName,
        width: dimensions?.width || 2000,
        height: dimensions?.height || 2000,
        is_active: true,
      }, {
        onConflict: 'session_id',
      });

    if (mapError) {
      console.error('[BattleController] Ошибка сохранения карты:', mapError);
      throw mapError;
    }

    // Обновляем game_sessions
    const { error: sessionError } = await supabase
      .from('game_sessions')
      .update({ current_map_url: mapUrl })
      .eq('id', this.sessionId);

    if (sessionError) {
      console.error('[BattleController] Ошибка обновления сессии:', sessionError);
      throw sessionError;
    }

    // Обновляем локальное состояние
    this.state.mapUrl = mapUrl;
    if (dimensions) {
      this.state.mapSize = dimensions;
    }
    
    this.emit();
    console.log('[BattleController] Карта успешно загружена');
  }

  async setMapFromUrl(url: string): Promise<void> {
    if (!this.isDM) {
      throw new Error('Только DM может менять карту');
    }

    const dimensions = await this.getImageDimensions(url);

    // Сохраняем в battle_maps
    const { error: mapError } = await supabase
      .from('battle_maps')
      .upsert({
        session_id: this.sessionId,
        name: 'Map from URL',
        file_url: url,
        image_url: url,
        width: dimensions?.width || 2000,
        height: dimensions?.height || 2000,
        is_active: true,
      }, {
        onConflict: 'session_id',
      });

    if (mapError) throw mapError;

    // Обновляем game_sessions
    const { error: sessionError } = await supabase
      .from('game_sessions')
      .update({ current_map_url: url })
      .eq('id', this.sessionId);

    if (sessionError) throw sessionError;

    this.state.mapUrl = url;
    if (dimensions) {
      this.state.mapSize = dimensions;
    }
    
    this.emit();
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================

  private async loadTokens(): Promise<void> {
    const { data, error } = await supabase
      .from('battle_tokens')
      .select('*')
      .eq('session_id', this.sessionId);

    if (error) {
      console.error('[BattleController] Ошибка загрузки токенов:', error);
      return;
    }

    this.state.tokens = (data || []).map(this.mapTokenFromDB);
    this.emit();
  }

  private mapTokenFromDB(dbToken: any): BattleToken {
    return {
      id: dbToken.id,
      name: dbToken.name,
      position: [dbToken.position_x, dbToken.position_y, 0],
      hp: dbToken.current_hp || 10,
      maxHp: dbToken.max_hp || 10,
      ac: dbToken.armor_class || 10,
      size: dbToken.size || 1,
      color: dbToken.color,
      imageUrl: dbToken.image_url,
      isVisible: dbToken.is_visible !== false,
      ownerId: dbToken.owner_id,
    };
  }

  async addToken(token: Partial<BattleToken>): Promise<string> {
    const newToken: BattleToken = {
      id: crypto.randomUUID(),
      name: token.name || 'New Token',
      position: token.position || [100, 100, 0],
      hp: token.hp || 10,
      maxHp: token.maxHp || 10,
      ac: token.ac || 10,
      size: token.size || 1,
      color: token.color || '#3b82f6',
      imageUrl: token.imageUrl,
      isVisible: token.isVisible !== false,
      ownerId: token.ownerId,
    };

    // Сохраняем в БД
    const { error } = await supabase
      .from('battle_tokens')
      .insert({
        id: newToken.id,
        session_id: this.sessionId,
        name: newToken.name,
        position_x: newToken.position[0],
        position_y: newToken.position[1],
        current_hp: newToken.hp,
        max_hp: newToken.maxHp,
        armor_class: newToken.ac,
        size: newToken.size,
        color: newToken.color,
        image_url: newToken.imageUrl,
        is_visible: newToken.isVisible,
        owner_id: newToken.ownerId,
        token_type: 'character',
      });

    if (error) {
      console.error('[BattleController] Ошибка добавления токена:', error);
      throw error;
    }

    this.state.tokens.push(newToken);
    this.emit();
    
    return newToken.id;
  }

  async updateToken(id: string, updates: Partial<BattleToken>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.position) {
      dbUpdates.position_x = updates.position[0];
      dbUpdates.position_y = updates.position[1];
    }
    if (updates.hp !== undefined) dbUpdates.current_hp = updates.hp;
    if (updates.maxHp !== undefined) dbUpdates.max_hp = updates.maxHp;
    if (updates.ac !== undefined) dbUpdates.armor_class = updates.ac;
    if (updates.size !== undefined) dbUpdates.size = updates.size;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.isVisible !== undefined) dbUpdates.is_visible = updates.isVisible;

    const { error } = await supabase
      .from('battle_tokens')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('[BattleController] Ошибка обновления токена:', error);
      throw error;
    }

    const index = this.state.tokens.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.tokens[index] = { ...this.state.tokens[index], ...updates };
      this.emit();
    }
  }

  async removeToken(id: string): Promise<void> {
    const { error } = await supabase
      .from('battle_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[BattleController] Ошибка удаления токена:', error);
      throw error;
    }

    this.state.tokens = this.state.tokens.filter(t => t.id !== id);
    this.emit();
  }

  // ========================================
  // FOG OF WAR
  // ========================================

  private async loadFogOfWar(): Promise<void> {
    const gridW = Math.ceil(this.state.mapSize.width / 50);
    const gridH = Math.ceil(this.state.mapSize.height / 50);

    const { data, error } = await supabase
      .from('fog_of_war')
      .select('*')
      .eq('session_id', this.sessionId);

    if (error) {
      console.error('[BattleController] Ошибка загрузки тумана:', error);
      return;
    }

    const grid = Array.from({ length: gridH }, () =>
      Array.from({ length: gridW }, () => 0)
    );

    (data || []).forEach((cell: any) => {
      if (cell.grid_x < gridW && cell.grid_y < gridH) {
        grid[cell.grid_y][cell.grid_x] = cell.is_revealed ? 1 : 0;
      }
    });

    this.state.fogGrid = grid;
    this.emit();
  }

  async setFogCell(x: number, y: number, revealed: boolean): Promise<void> {
    if (!this.isDM) return;

    const { error } = await supabase
      .from('fog_of_war')
      .upsert({
        session_id: this.sessionId,
        map_id: 'main-map',
        grid_x: x,
        grid_y: y,
        is_revealed: revealed,
      }, {
        onConflict: 'session_id,map_id,grid_x,grid_y',
      });

    if (error) {
      console.error('[BattleController] Ошибка обновления тумана:', error);
      return;
    }

    if (this.state.fogGrid[y] && this.state.fogGrid[y][x] !== undefined) {
      this.state.fogGrid[y][x] = revealed ? 1 : 0;
      this.emit();
    }
  }

  // ========================================
  // REALTIME SYNC
  // ========================================

  private setupRealtimeSync(): void {
    // Синхронизация карты
    const mapChannel = supabase
      .channel(`map-sync-${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${this.sessionId}`,
        },
        (payload: any) => {
          if (payload.new?.current_map_url) {
            this.state.mapUrl = payload.new.current_map_url;
            this.emit();
          }
        }
      )
      .subscribe();

    // Синхронизация токенов
    const tokensChannel = supabase
      .channel(`tokens-sync-${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${this.sessionId}`,
        },
        (payload: any) => {
          const newToken = this.mapTokenFromDB(payload.new);
          if (!this.state.tokens.find(t => t.id === newToken.id)) {
            this.state.tokens.push(newToken);
            this.emit();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${this.sessionId}`,
        },
        (payload: any) => {
          const updated = this.mapTokenFromDB(payload.new);
          const index = this.state.tokens.findIndex(t => t.id === updated.id);
          if (index !== -1) {
            this.state.tokens[index] = updated;
            this.emit();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'battle_tokens',
          filter: `session_id=eq.${this.sessionId}`,
        },
        (payload: any) => {
          this.state.tokens = this.state.tokens.filter(t => t.id !== payload.old.id);
          this.emit();
        }
      )
      .subscribe();

    // Синхронизация тумана войны (только для игроков)
    if (!this.isDM) {
      const fogChannel = supabase
        .channel(`fog-sync-${this.sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fog_of_war',
            filter: `session_id=eq.${this.sessionId}`,
          },
          (payload: any) => {
            const cell = payload.new;
            if (cell && this.state.fogGrid[cell.grid_y]) {
              this.state.fogGrid[cell.grid_y][cell.grid_x] = cell.is_revealed ? 1 : 0;
              this.emit();
            }
          }
        )
        .subscribe();

      this.channels.push(fogChannel);
    }

    this.channels.push(mapChannel, tokensChannel);
  }

  // ========================================
  // CLEANUP
  // ========================================

  destroy(): void {
    console.log('[BattleController] Очистка...');
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels = [];
    this.listeners.clear();
  }
}
