-- Сначала удаляем старый foreign key constraint
ALTER TABLE public.battle_maps 
DROP CONSTRAINT IF EXISTS battle_maps_session_id_fkey;

-- Затем обновляем старые карты на демо-сессию
UPDATE public.battle_maps
SET session_id = '11111111-1111-1111-1111-111111111111'
WHERE session_id NOT IN (SELECT id FROM public.game_sessions);

-- Теперь создаем новый foreign key constraint на game_sessions
ALTER TABLE public.battle_maps 
ADD CONSTRAINT battle_maps_session_id_fkey 
FOREIGN KEY (session_id) 
REFERENCES public.game_sessions(id) 
ON DELETE CASCADE;