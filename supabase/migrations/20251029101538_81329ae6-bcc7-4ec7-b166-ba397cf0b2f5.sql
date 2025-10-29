-- Обновляем триггер лога ролей, чтобы он работал с автоматическим присвоением ролей
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Используем COALESCE чтобы разрешить null user_id (для системных операций)
        INSERT INTO public.role_audit_log (user_id, target_user_id, action, role)
        VALUES (COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NEW.user_id, 'assign', NEW.role);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.role_audit_log (user_id, target_user_id, action, role)
        VALUES (COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), OLD.user_id, 'remove', OLD.role);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Создаем функцию для автоматического добавления роли 'player' новым пользователям
CREATE OR REPLACE FUNCTION public.assign_player_role_to_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Добавляем роль 'player' новому пользователю
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер на таблицу profiles (вызывается после создания профиля)
DROP TRIGGER IF EXISTS assign_player_role_trigger ON public.profiles;
CREATE TRIGGER assign_player_role_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_player_role_to_new_user();

-- Добавляем роль 'player' всем существующим пользователям, у которых нет ролей
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'player'::app_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
)
ON CONFLICT (user_id, role) DO NOTHING;