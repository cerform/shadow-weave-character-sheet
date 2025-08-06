-- Назначаем роль админа текущему аутентифицированному пользователю
INSERT INTO public.user_roles (user_id, role) 
VALUES (
  (SELECT auth.uid()),
  'admin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;