-- Удаляем старую политику SELECT для characters
DROP POLICY IF EXISTS "Пользователи могут просматривать " ON public.characters;