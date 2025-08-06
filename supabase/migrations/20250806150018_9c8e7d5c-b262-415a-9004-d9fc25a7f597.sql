-- Назначаем роль админа текущему пользователю
INSERT INTO public.user_roles (user_id, role) 
SELECT auth.uid(), 'admin'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;