-- Создаем бакет для хранения карт
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'battle-maps', 
  'battle-maps', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Создаем таблицу для DM сессий
CREATE TABLE IF NOT EXISTS public.dm_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  current_map_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Создаем таблицу для карт
CREATE TABLE IF NOT EXISTS public.battle_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.dm_sessions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  width INTEGER,
  height INTEGER,
  grid_size INTEGER DEFAULT 64,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS для сессий
ALTER TABLE public.dm_sessions ENABLE ROW LEVEL SECURITY;

-- Политики для сессий - только DM может управлять своими сессиями
CREATE POLICY "DM can manage own sessions" ON public.dm_sessions
  FOR ALL USING (auth.uid() = dm_id);

-- Включаем RLS для карт
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;

-- Политики для карт - доступ через сессии DM
CREATE POLICY "DM can manage maps in own sessions" ON public.battle_maps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dm_sessions ds 
      WHERE ds.id = battle_maps.session_id 
      AND ds.dm_id = auth.uid()
    )
  );

-- Политики для хранилища карт - только DM может загружать в свои папки
CREATE POLICY "DM can upload maps to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'battle-maps' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "DM can view own maps" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'battle-maps' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "DM can update own maps" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'battle-maps' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "DM can delete own maps" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'battle-maps' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Функция для обновления времени изменения
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_dm_sessions_updated_at
  BEFORE UPDATE ON public.dm_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_battle_maps_updated_at
  BEFORE UPDATE ON public.battle_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для создания сессии по умолчанию
CREATE OR REPLACE FUNCTION public.ensure_default_session(user_id UUID)
RETURNS UUID AS $$
DECLARE
  session_uuid UUID;
BEGIN
  -- Проверяем, есть ли уже активная сессия
  SELECT id INTO session_uuid 
  FROM public.dm_sessions 
  WHERE dm_id = user_id AND is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Если нет, создаем новую
  IF session_uuid IS NULL THEN
    INSERT INTO public.dm_sessions (dm_id, name, description)
    VALUES (user_id, 'Основная сессия', 'Автоматически созданная сессия')
    RETURNING id INTO session_uuid;
  END IF;
  
  RETURN session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;