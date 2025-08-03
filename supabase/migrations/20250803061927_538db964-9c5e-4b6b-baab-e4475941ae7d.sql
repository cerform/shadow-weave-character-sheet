-- Создаем enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'dm', 'player');

-- Создаем таблицу ролей пользователей
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Включаем RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Создаем функцию для проверки ролей (SECURITY DEFINER для обхода RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Создаем функцию для получения всех ролей пользователя
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- RLS политики для user_roles
-- Админы могут видеть и изменять все роли
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Пользователи могут видеть только свои роли
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Назначаем вам роль админа (замените на ваш user_id)
INSERT INTO public.user_roles (user_id, role)
VALUES ('ae24e6bb-5dcf-4ccf-a692-5d562b443144', 'admin');

-- Также добавляем роль DM для доступа к DM функциям
INSERT INTO public.user_roles (user_id, role)
VALUES ('ae24e6bb-5dcf-4ccf-a692-5d562b443144', 'dm');

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();