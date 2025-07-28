-- Создаем таблицы для игровых сессий
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  session_code VARCHAR(8) UNIQUE NOT NULL,
  dm_id UUID NOT NULL,
  max_players INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  current_map_id UUID,
  fog_of_war_enabled BOOLEAN DEFAULT true,
  grid_enabled BOOLEAN DEFAULT true,
  grid_size INTEGER DEFAULT 25,
  zoom_level FLOAT DEFAULT 1.0,
  view_center_x FLOAT DEFAULT 0,
  view_center_y FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Создаем таблицу для игроков в сессии
CREATE TABLE public.session_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  character_id UUID,
  player_name TEXT NOT NULL,
  is_online BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  UNIQUE(session_id, user_id)
);

-- Создаем таблицу для карт
CREATE TABLE public.battle_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  width INTEGER NOT NULL DEFAULT 800,
  height INTEGER NOT NULL DEFAULT 600,
  grid_size INTEGER DEFAULT 25,
  background_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для токенов на карте
CREATE TABLE public.battle_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  map_id UUID REFERENCES battle_maps(id) ON DELETE CASCADE,
  character_id UUID,
  name TEXT NOT NULL,
  image_url TEXT,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  size FLOAT DEFAULT 1.0,
  color TEXT DEFAULT '#ff0000',
  token_type TEXT NOT NULL DEFAULT 'character',
  current_hp INTEGER,
  max_hp INTEGER,
  armor_class INTEGER,
  is_visible BOOLEAN DEFAULT true,
  is_hidden_from_players BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для инициативы
CREATE TABLE public.initiative_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  token_id UUID REFERENCES battle_tokens(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  initiative_roll INTEGER NOT NULL,
  initiative_modifier INTEGER DEFAULT 0,
  is_current_turn BOOLEAN DEFAULT false,
  turn_order INTEGER NOT NULL,
  round_number INTEGER DEFAULT 1,
  has_acted_this_turn BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для сообщений чата
CREATE TABLE public.session_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  content TEXT NOT NULL,
  dice_roll_data JSONB,
  is_whisper BOOLEAN DEFAULT false,
  whisper_to_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для тумана войны
CREATE TABLE public.fog_of_war (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  map_id UUID NOT NULL REFERENCES battle_maps(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  is_revealed BOOLEAN DEFAULT false,
  revealed_at TIMESTAMP WITH TIME ZONE,
  revealed_by_user_id UUID,
  UNIQUE(session_id, map_id, grid_x, grid_y)
);

-- Включаем RLS на всех таблицах
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fog_of_war ENABLE ROW LEVEL SECURITY;

-- Политики RLS для game_sessions
CREATE POLICY "DM может управлять своими сессиями"
ON public.game_sessions
FOR ALL
USING (auth.uid() = dm_id);

CREATE POLICY "Игроки могут видеть сессии где участвуют"
ON public.game_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.session_players 
    WHERE session_players.session_id = game_sessions.id 
    AND session_players.user_id = auth.uid()
  )
);

-- Политики RLS для session_players
CREATE POLICY "Участники сессии могут видеть других игроков"
ON public.session_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_players.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players sp2 
                WHERE sp2.session_id = session_players.session_id 
                AND sp2.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять игроками"
ON public.session_players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_players.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Политики RLS для battle_maps
CREATE POLICY "Участники сессии могут видеть карты"
ON public.battle_maps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_maps.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = battle_maps.session_id 
                AND session_players.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять картами"
ON public.battle_maps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_maps.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Политики RLS для battle_tokens
CREATE POLICY "Участники сессии могут видеть токены"
ON public.battle_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_tokens.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = battle_tokens.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND (is_hidden_from_players = false OR 
         EXISTS (SELECT 1 FROM public.game_sessions 
                WHERE game_sessions.id = battle_tokens.session_id 
                AND game_sessions.dm_id = auth.uid()))
);

CREATE POLICY "DM может управлять токенами"
ON public.battle_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_tokens.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

CREATE POLICY "Игроки могут перемещать свои токены"
ON public.battle_tokens
FOR UPDATE
USING (
  character_id IN (
    SELECT characters.id FROM public.characters 
    WHERE characters.user_id = auth.uid()
  )
);

-- Политики RLS для инициативы
CREATE POLICY "Участники сессии могут видеть инициативу"
ON public.initiative_tracker
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = initiative_tracker.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = initiative_tracker.session_id 
                AND session_players.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять инициативой"
ON public.initiative_tracker
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = initiative_tracker.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Политики RLS для сообщений
CREATE POLICY "Участники сессии могут видеть сообщения"
ON public.session_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_messages.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = session_messages.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND (is_whisper = false OR whisper_to_user_id = auth.uid() OR user_id = auth.uid())
);

CREATE POLICY "Участники сессии могут отправлять сообщения"
ON public.session_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_messages.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = session_messages.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND user_id = auth.uid()
);

-- Политики RLS для тумана войны
CREATE POLICY "DM может управлять туманом войны"
ON public.fog_of_war
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = fog_of_war.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

CREATE POLICY "Игроки могут видеть открытые области"
ON public.fog_of_war
FOR SELECT
USING (
  is_revealed = true AND
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = fog_of_war.session_id 
    AND EXISTS (SELECT 1 FROM public.session_players 
               WHERE session_players.session_id = fog_of_war.session_id 
               AND session_players.user_id = auth.uid())
  )
);

-- Создаем функцию для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Добавляем триггеры для автообновления updated_at
CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battle_maps_updated_at
    BEFORE UPDATE ON public.battle_maps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battle_tokens_updated_at
    BEFORE UPDATE ON public.battle_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiative_tracker_updated_at
    BEFORE UPDATE ON public.initiative_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для генерации уникального кода сессии
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Генерируем 6-символьный код
        code := upper(substr(md5(random()::text), 1, 6));
        
        -- Проверяем, существует ли уже такой код
        SELECT EXISTS(SELECT 1 FROM public.game_sessions WHERE session_code = code AND is_active = true)
        INTO code_exists;
        
        -- Если код уникален, выходим из цикла
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;