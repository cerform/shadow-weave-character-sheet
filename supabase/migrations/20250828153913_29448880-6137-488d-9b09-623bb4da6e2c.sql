-- Создаем таблицу для DM сессий (используем существующую game_sessions если нужна связь)
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

-- Включаем RLS для сессий
ALTER TABLE public.dm_sessions ENABLE ROW LEVEL SECURITY;

-- Политики для сессий - только DM может управлять своими сессиями
CREATE POLICY "DM can manage own sessions" ON public.dm_sessions
  FOR ALL USING (auth.uid() = dm_id);

-- Обновляем таблицу battle_maps для связи с новыми DM сессиями
-- Добавляем колонку для пути к файлу и URL
ALTER TABLE public.battle_maps 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT;

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

-- Функция для автоматического сохранения карты
CREATE OR REPLACE FUNCTION public.save_battle_map(
  p_session_id UUID,
  p_name TEXT,
  p_file_path TEXT,
  p_file_url TEXT,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_grid_size INTEGER DEFAULT 64
)
RETURNS UUID AS $$
DECLARE
  map_id UUID;
BEGIN
  -- Создаем или обновляем карту
  INSERT INTO public.battle_maps (
    session_id,
    name,
    image_url,
    file_path,
    file_url,
    width,
    height,
    grid_size,
    is_active
  ) VALUES (
    p_session_id,
    p_name,
    p_file_url,
    p_file_path,
    p_file_url,
    p_width,
    p_height,
    p_grid_size,
    true
  )
  ON CONFLICT (session_id) WHERE is_active = true
  DO UPDATE SET 
    name = EXCLUDED.name,
    image_url = EXCLUDED.image_url,
    file_path = EXCLUDED.file_path,
    file_url = EXCLUDED.file_url,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    grid_size = EXCLUDED.grid_size,
    updated_at = NOW()
  RETURNING id INTO map_id;

  -- Обновляем URL текущей карты в сессии DM
  UPDATE public.dm_sessions 
  SET current_map_url = p_file_url,
      updated_at = NOW()
  WHERE id = p_session_id;

  RETURN map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;