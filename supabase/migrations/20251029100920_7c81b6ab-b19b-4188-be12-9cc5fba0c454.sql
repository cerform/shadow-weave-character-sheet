-- Удаляем старые политики для battle_maps
DROP POLICY IF EXISTS "battle_maps_select_session_participants" ON public.battle_maps;
DROP POLICY IF EXISTS "battle_maps_insert_owner" ON public.battle_maps;
DROP POLICY IF EXISTS "battle_maps_update_owner" ON public.battle_maps;
DROP POLICY IF EXISTS "battle_maps_delete_owner" ON public.battle_maps;

-- Создаем новые политики для battle_maps, работающие с game_sessions
-- Участники сессии (DM и игроки) могут видеть карты
CREATE POLICY "battle_maps_select_participants"
ON public.battle_maps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = battle_maps.session_id
    AND (
      gs.dm_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.session_players sp
        WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
      )
    )
  )
);

-- Только DM может создавать карты
CREATE POLICY "battle_maps_insert_dm"
ON public.battle_maps
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = battle_maps.session_id AND gs.dm_id = auth.uid()
  )
);

-- Только DM может обновлять карты
CREATE POLICY "battle_maps_update_dm"
ON public.battle_maps
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = battle_maps.session_id AND gs.dm_id = auth.uid()
  )
);

-- Только DM может удалять карты
CREATE POLICY "battle_maps_delete_dm"
ON public.battle_maps
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = battle_maps.session_id AND gs.dm_id = auth.uid()
  )
);