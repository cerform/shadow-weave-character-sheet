-- Обновляем функцию для автоматического добавления ролей новым пользователям
-- Теперь она проверяет метаданные is_dm и добавляет соответствующую роль
CREATE OR REPLACE FUNCTION public.assign_player_role_to_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_metadata jsonb;
  is_dm_flag boolean;
BEGIN
  -- Получаем метаданные пользователя из auth.users
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Проверяем флаг is_dm в метаданных
  is_dm_flag := COALESCE((user_metadata->>'is_dm')::boolean, false);
  
  IF is_dm_flag THEN
    -- Если пользователь выбрал роль DM при регистрации, добавляем роль 'dm'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'dm'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Также добавляем роль 'player' для совместимости
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'player'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Обычный пользователь получает только роль 'player'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'player'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;