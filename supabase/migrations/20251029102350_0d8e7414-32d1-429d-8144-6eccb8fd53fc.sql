-- Добавляем роль 'dm' существующим пользователям, у которых в метаданных is_dm = true
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id, 
  'dm'::app_role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE (u.raw_user_meta_data->>'is_dm')::boolean = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'dm'::app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;