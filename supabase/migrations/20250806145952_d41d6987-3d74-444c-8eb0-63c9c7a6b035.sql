-- Сначала создаем таблицу ролей пользователей, если её нет
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Включаем RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Создаем политики для чтения ролей
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Политика для админов (могут видеть все роли)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Политика для админов (могут управлять ролями)
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Назначаем роль админа текущему пользователю
INSERT INTO public.user_roles (user_id, role) 
SELECT auth.uid(), 'admin'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;