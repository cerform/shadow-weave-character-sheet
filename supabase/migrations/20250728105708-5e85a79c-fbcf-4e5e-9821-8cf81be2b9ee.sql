-- Создаем таблицы для DM Dashboard

-- Таблица для сохранения состояния боя
CREATE TABLE public.battle_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  map_name TEXT DEFAULT 'Новая карта',
  map_image_url TEXT,
  grid_size INTEGER DEFAULT 30,
  grid_width INTEGER DEFAULT 40,
  grid_height INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  fog_of_war JSONB DEFAULT '[]'::jsonb,
  dm_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для токенов на карте боя
CREATE TABLE public.battle_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_session_id UUID REFERENCES public.battle_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_type TEXT NOT NULL CHECK (token_type IN ('player', 'npc', 'monster', 'object')),
  x_position INTEGER NOT NULL DEFAULT 0,
  y_position INTEGER NOT NULL DEFAULT 0,
  size INTEGER DEFAULT 1,
  color TEXT DEFAULT '#3b82f6',
  image_url TEXT,
  max_hp INTEGER,
  current_hp INTEGER,
  armor_class INTEGER,
  initiative INTEGER,
  is_hidden BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для лога боя
CREATE TABLE public.battle_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_session_id UUID REFERENCES public.battle_sessions(id) ON DELETE CASCADE,
  round_number INTEGER DEFAULT 1,
  action_type TEXT NOT NULL,
  actor_token_id UUID REFERENCES public.battle_tokens(id) ON DELETE CASCADE,
  target_token_id UUID REFERENCES public.battle_tokens(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  damage_dealt INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_log ENABLE ROW LEVEL SECURITY;

-- Политики для battle_sessions
CREATE POLICY "DM can manage battle sessions" ON public.battle_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs 
    WHERE gs.id = battle_sessions.session_id 
    AND gs.dm_user_id = auth.uid()
  )
);

CREATE POLICY "Players can view battle sessions" ON public.battle_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.session_players sp
    JOIN public.game_sessions gs ON gs.id = sp.session_id
    WHERE gs.id = battle_sessions.session_id 
    AND sp.user_id = auth.uid()
  )
);

-- Политики для battle_tokens
CREATE POLICY "DM can manage battle tokens" ON public.battle_tokens
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.battle_sessions bs
    JOIN public.game_sessions gs ON gs.id = bs.session_id
    WHERE bs.id = battle_tokens.battle_session_id 
    AND gs.dm_user_id = auth.uid()
  )
);

CREATE POLICY "Players can view battle tokens" ON public.battle_tokens
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.battle_sessions bs
    JOIN public.session_players sp ON sp.session_id = bs.session_id
    JOIN public.game_sessions gs ON gs.id = bs.session_id
    WHERE bs.id = battle_tokens.battle_session_id 
    AND sp.user_id = auth.uid()
  )
);

-- Политики для battle_log
CREATE POLICY "DM can manage battle log" ON public.battle_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.battle_sessions bs
    JOIN public.game_sessions gs ON gs.id = bs.session_id
    WHERE bs.id = battle_log.battle_session_id 
    AND gs.dm_user_id = auth.uid()
  )
);

CREATE POLICY "Players can view battle log" ON public.battle_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.battle_sessions bs
    JOIN public.session_players sp ON sp.session_id = bs.session_id
    JOIN public.game_sessions gs ON gs.id = bs.session_id
    WHERE bs.id = battle_log.battle_session_id 
    AND sp.user_id = auth.uid()
  )
);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_battle_sessions_updated_at
  BEFORE UPDATE ON public.battle_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_battle_tokens_updated_at
  BEFORE UPDATE ON public.battle_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Настройка realtime для синхронизации
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_log;

ALTER TABLE public.battle_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.battle_tokens REPLICA IDENTITY FULL;
ALTER TABLE public.battle_log REPLICA IDENTITY FULL;