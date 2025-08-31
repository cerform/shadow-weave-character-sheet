-- Создаем таблицу для сообщений чата
CREATE TABLE public.session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.dm_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'dice', 'action')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу для музыки сессии
CREATE TABLE public.session_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.dm_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  volume FLOAT DEFAULT 0.5 CHECK (volume >= 0 AND volume <= 1),
  is_playing BOOLEAN DEFAULT false,
  is_loop BOOLEAN DEFAULT false,
  position FLOAT DEFAULT 0,
  audio_type TEXT DEFAULT 'background' CHECK (audio_type IN ('background', 'effect', 'ambient')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу для синхронизации состояния сессии
CREATE TABLE public.session_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.dm_sessions(id) ON DELETE CASCADE,
  current_map_url TEXT,
  map_scale FLOAT DEFAULT 100,
  fog_enabled BOOLEAN DEFAULT false,
  grid_visible BOOLEAN DEFAULT true,
  grid_scale FLOAT DEFAULT 100,
  camera_position JSONB DEFAULT '{"x": 0, "y": 20, "z": 0}',
  active_audio_id UUID REFERENCES public.session_audio(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_state ENABLE ROW LEVEL SECURITY;

-- Политики для сообщений чата
CREATE POLICY "Users can view session messages if they are participants"
ON public.session_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id 
    AND (ds.dm_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.session_players sp 
      WHERE sp.session_id = ds.id AND sp.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can insert session messages if they are participants"
ON public.session_messages FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id 
    AND (ds.dm_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.session_players sp 
      WHERE sp.session_id = ds.id AND sp.user_id = auth.uid()
    ))
  )
);

-- Политики для аудио
CREATE POLICY "DM can manage session audio"
ON public.session_audio FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id AND ds.dm_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id AND ds.dm_id = auth.uid()
  )
);

CREATE POLICY "Players can view session audio"
ON public.session_audio FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id 
    AND (ds.dm_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.session_players sp 
      WHERE sp.session_id = ds.id AND sp.user_id = auth.uid()
    ))
  )
);

-- Политики для состояния сессии
CREATE POLICY "DM can manage session state"
ON public.session_state FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id AND ds.dm_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id AND ds.dm_id = auth.uid()
  )
);

CREATE POLICY "Players can view session state"
ON public.session_state FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds 
    WHERE ds.id = session_id 
    AND (ds.dm_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.session_players sp 
      WHERE sp.session_id = ds.id AND sp.user_id = auth.uid()
    ))
  )
);

-- Добавляем триггеры для updated_at
CREATE TRIGGER update_session_audio_updated_at
  BEFORE UPDATE ON public.session_audio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_state_updated_at
  BEFORE UPDATE ON public.session_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Создаем функцию для отправки системных сообщений
CREATE OR REPLACE FUNCTION public.send_system_message(
  p_session_id UUID,
  p_message TEXT,
  p_message_type TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.session_messages (
    session_id,
    user_id,
    username,
    message,
    message_type
  ) VALUES (
    p_session_id,
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Система',
    p_message,
    p_message_type
  ) RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;