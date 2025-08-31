-- Исправляем foreign key constraint для battle_maps
-- Сначала удаляем старый constraint, если он существует
ALTER TABLE public.battle_maps DROP CONSTRAINT IF EXISTS battle_maps_session_id_fkey;

-- Создаем правильный foreign key, который ссылается на dm_sessions
ALTER TABLE public.battle_maps 
ADD CONSTRAINT battle_maps_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.dm_sessions(id) 
ON DELETE CASCADE;