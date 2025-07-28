import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface GameSession {
  id: string;
  name: string;
  description?: string;
  session_code: string;
  dm_id: string;
  max_players: number;
  is_active: boolean;
  current_map_id?: string;
  fog_of_war_enabled: boolean;
  grid_enabled: boolean;
  grid_size: number;
  zoom_level: number;
  view_center_x: number;
  view_center_y: number;
  created_at: string;
  updated_at: string;
  ended_at?: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  user_id: string;
  character_id?: string;
  player_name: string;
  is_online: boolean;
  joined_at: string;
  last_seen: string;
  position_x: number;
  position_y: number;
  is_visible: boolean;
}

export interface BattleMap {
  id: string;
  session_id: string;
  name: string;
  image_url?: string;
  width: number;
  height: number;
  grid_size: number;
  background_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BattleToken {
  id: string;
  session_id: string;
  map_id?: string;
  character_id?: string;
  name: string;
  image_url?: string;
  position_x: number;
  position_y: number;
  size: number;
  color: string;
  token_type: string;
  current_hp?: number;
  max_hp?: number;
  armor_class?: number;
  is_visible: boolean;
  is_hidden_from_players: boolean;
  conditions: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  sender_name: string;
  message_type: string;
  content: string;
  dice_roll_data?: any;
  is_whisper: boolean;
  whisper_to_user_id?: string;
  created_at: string;
}

export interface InitiativeEntry {
  id: string;
  session_id: string;
  token_id?: string;
  character_name: string;
  initiative_roll: number;
  initiative_modifier: number;
  is_current_turn: boolean;
  turn_order: number;
  round_number: number;
  has_acted_this_turn: boolean;
  created_at: string;
  updated_at: string;
}

class SessionService {
  // Создание новой сессии
  async createSession(name: string, description?: string): Promise<GameSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    // Генерируем код сессии
    const { data: sessionCode, error: codeError } = await supabase.rpc('generate_session_code');
    if (codeError) throw codeError;

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        name,
        description,
        session_code: sessionCode,
        dm_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Присоединение к сессии
  async joinSession(sessionCode: string, playerName: string, characterId?: string): Promise<string> {
    const { data: sessionId, error } = await supabase.rpc('join_session', {
      session_code_param: sessionCode,
      player_name_param: playerName,
      character_id_param: characterId
    });

    if (error) throw error;
    return sessionId;
  }

  // Получение сессии по ID
  async getSession(sessionId: string): Promise<GameSession> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  // Получение сессий пользователя
  async getUserSessions(): Promise<GameSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .or(`dm_id.eq.${user.id},id.in.(${await this.getUserSessionIds()})`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Получение ID сессий где участвует пользователь
  private async getUserSessionIds(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    const { data } = await supabase
      .from('session_players')
      .select('session_id')
      .eq('user_id', user.id);

    return data?.map(p => p.session_id).join(',') || '';
  }

  // Получение игроков сессии
  async getSessionPlayers(sessionId: string): Promise<SessionPlayer[]> {
    const { data, error } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at');

    if (error) throw error;
    return data;
  }

  // Обновление статуса онлайн игрока
  async updatePlayerOnlineStatus(sessionId: string, isOnline: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { error } = await supabase
      .from('session_players')
      .update({ 
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Завершение сессии
  async endSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('game_sessions')
      .update({ 
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Создание карты
  async createMap(sessionId: string, name: string, imageUrl?: string, width = 800, height = 600): Promise<BattleMap> {
    const { data, error } = await supabase
      .from('battle_maps')
      .insert({
        session_id: sessionId,
        name,
        image_url: imageUrl,
        width,
        height,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Получение карт сессии
  async getSessionMaps(sessionId: string): Promise<BattleMap[]> {
    const { data, error } = await supabase
      .from('battle_maps')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) throw error;
    return data;
  }

  // Установка активной карты
  async setActiveMap(sessionId: string, mapId: string): Promise<void> {
    // Сначала деактивируем все карты
    await supabase
      .from('battle_maps')
      .update({ is_active: false })
      .eq('session_id', sessionId);

    // Активируем выбранную карту
    const { error } = await supabase
      .from('battle_maps')
      .update({ is_active: true })
      .eq('id', mapId);

    if (error) throw error;

    // Обновляем текущую карту в сессии
    await supabase
      .from('game_sessions')
      .update({ current_map_id: mapId })
      .eq('id', sessionId);
  }

  // Создание токена
  async createToken(sessionId: string, tokenData: Omit<BattleToken, 'id' | 'session_id' | 'created_at' | 'updated_at'>): Promise<BattleToken> {
    const { data, error } = await supabase
      .from('battle_tokens')
      .insert({
        session_id: sessionId,
        name: tokenData.name,
        position_x: tokenData.position_x,
        position_y: tokenData.position_y,
        size: tokenData.size || 1.0,
        color: tokenData.color,
        token_type: tokenData.token_type,
        map_id: tokenData.map_id,
        character_id: tokenData.character_id,
        image_url: tokenData.image_url,
        current_hp: tokenData.current_hp,
        max_hp: tokenData.max_hp,
        armor_class: tokenData.armor_class,
        is_visible: tokenData.is_visible,
        is_hidden_from_players: tokenData.is_hidden_from_players,
        conditions: tokenData.conditions || [],
        notes: tokenData.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      conditions: Array.isArray(data.conditions) ? data.conditions : []
    } as BattleToken;
  }

  // Получение токенов карты
  async getMapTokens(sessionId: string, mapId?: string): Promise<BattleToken[]> {
    let query = supabase
      .from('battle_tokens')
      .select('*')
      .eq('session_id', sessionId);

    if (mapId) {
      query = query.eq('map_id', mapId);
    }

    const { data, error } = await query.order('created_at');

    if (error) throw error;
    return data.map(token => ({
      ...token,
      conditions: Array.isArray(token.conditions) ? token.conditions : []
    })) as BattleToken[];
  }

  // Обновление позиции токена
  async updateTokenPosition(tokenId: string, x: number, y: number): Promise<void> {
    const { error } = await supabase
      .from('battle_tokens')
      .update({ position_x: x, position_y: y })
      .eq('id', tokenId);

    if (error) throw error;
  }

  // Обновление токена
  async updateToken(tokenId: string, updates: Partial<BattleToken>): Promise<void> {
    const { error } = await supabase
      .from('battle_tokens')
      .update(updates)
      .eq('id', tokenId);

    if (error) throw error;
  }

  // Удаление токена
  async deleteToken(tokenId: string): Promise<void> {
    const { error } = await supabase
      .from('battle_tokens')
      .delete()
      .eq('id', tokenId);

    if (error) throw error;
  }

  // Отправка сообщения в чат
  async sendMessage(sessionId: string, content: string, messageType = 'chat', diceRollData?: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { error } = await supabase
      .from('session_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        sender_name: user.email?.split('@')[0] || 'Аноним',
        message_type: messageType,
        content,
        dice_roll_data: diceRollData,
      });

    if (error) throw error;
  }

  // Получение сообщений чата
  async getSessionMessages(sessionId: string, limit = 50): Promise<SessionMessage[]> {
    const { data, error } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse(); // Возвращаем в хронологическом порядке
  }

  // Инициатива
  async createInitiativeEntry(sessionId: string, entryData: Omit<InitiativeEntry, 'id' | 'session_id' | 'created_at' | 'updated_at'>): Promise<InitiativeEntry> {
    const { data, error } = await supabase
      .from('initiative_tracker')
      .insert({
        session_id: sessionId,
        character_name: entryData.character_name,
        initiative_roll: entryData.initiative_roll,
        initiative_modifier: entryData.initiative_modifier || 0,
        is_current_turn: entryData.is_current_turn || false,
        turn_order: entryData.turn_order,
        round_number: entryData.round_number || 1,
        has_acted_this_turn: entryData.has_acted_this_turn || false,
        token_id: entryData.token_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getInitiativeOrder(sessionId: string): Promise<InitiativeEntry[]> {
    const { data, error } = await supabase
      .from('initiative_tracker')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_order');

    if (error) throw error;
    return data;
  }

  async updateInitiativeTurn(sessionId: string, currentEntryId: string): Promise<void> {
    // Сбрасываем все текущие ходы
    await supabase
      .from('initiative_tracker')
      .update({ is_current_turn: false })
      .eq('session_id', sessionId);

    // Устанавливаем новый текущий ход
    const { error } = await supabase
      .from('initiative_tracker')
      .update({ is_current_turn: true })
      .eq('id', currentEntryId);

    if (error) throw error;
  }

  // Подписка на изменения в реальном времени
  subscribeToSession(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'battle_tokens', filter: `session_id=eq.${sessionId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'session_messages', filter: `session_id=eq.${sessionId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${sessionId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'initiative_tracker', filter: `session_id=eq.${sessionId}` },
        callback
      )
      .subscribe();
  }

  // Обновление настроек сессии
  async updateSessionSettings(sessionId: string, settings: Partial<GameSession>): Promise<void> {
    const { error } = await supabase
      .from('game_sessions')
      .update(settings)
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Управление туманом войны
  async revealFogArea(sessionId: string, mapId: string, gridX: number, gridY: number, radius = 1): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const fogCells = [];
    for (let x = gridX - radius; x <= gridX + radius; x++) {
      for (let y = gridY - radius; y <= gridY + radius; y++) {
        fogCells.push({
          session_id: sessionId,
          map_id: mapId,
          grid_x: x,
          grid_y: y,
          is_revealed: true,
          revealed_at: new Date().toISOString(),
          revealed_by_user_id: user.id,
        });
      }
    }

    const { error } = await supabase
      .from('fog_of_war')
      .upsert(fogCells, { 
        onConflict: 'session_id,map_id,grid_x,grid_y',
        ignoreDuplicates: false 
      });

    if (error) throw error;
  }

  async getFogOfWar(sessionId: string, mapId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('fog_of_war')
      .select('*')
      .eq('session_id', sessionId)
      .eq('map_id', mapId)
      .eq('is_revealed', true);

    if (error) throw error;
    return data;
  }
}

export const sessionService = new SessionService();
