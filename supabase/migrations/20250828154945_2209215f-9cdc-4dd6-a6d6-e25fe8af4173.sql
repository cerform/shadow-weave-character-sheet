-- Исправляем RLS политики для battle_maps
-- Сначала удаляем существующие политики
DROP POLICY IF EXISTS "DM может управлять картами" ON public.battle_maps;
DROP POLICY IF EXISTS "Участники сессии могут видеть кар" ON public.battle_maps;

-- Создаем новые, более гибкие политики

-- Политика для SELECT - участники сессии могут видеть карты
CREATE POLICY "battle_maps_select_session_participants" ON public.battle_maps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds
    WHERE ds.id = battle_maps.session_id 
    AND ds.dm_id = auth.uid()
  )
);

-- Политика для INSERT - любой аутентифицированный пользователь может создавать карты для своих сессий
CREATE POLICY "battle_maps_insert_owner" ON public.battle_maps
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds
    WHERE ds.id = battle_maps.session_id 
    AND ds.dm_id = auth.uid()
  )
);

-- Политика для UPDATE - только владелец сессии может обновлять карты
CREATE POLICY "battle_maps_update_owner" ON public.battle_maps
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds
    WHERE ds.id = battle_maps.session_id 
    AND ds.dm_id = auth.uid()
  )
);

-- Политика для DELETE - только владелец сессии может удалять карты
CREATE POLICY "battle_maps_delete_owner" ON public.battle_maps
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.dm_sessions ds
    WHERE ds.id = battle_maps.session_id 
    AND ds.dm_id = auth.uid()
  )
);