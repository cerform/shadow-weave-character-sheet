-- Исправление RLS политик для fog_of_war
-- Меняем роль с public на authenticated для корректной работы с Realtime

-- Удаляем старые политики
DROP POLICY IF EXISTS "DM can manage fog of war for their sessions" ON public.fog_of_war;
DROP POLICY IF EXISTS "Session participants can view fog of war" ON public.fog_of_war;

-- Создаем исправленные политики для authenticated пользователей
CREATE POLICY "DM can manage fog of war for their sessions"
ON public.fog_of_war
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
);

CREATE POLICY "Session participants can view fog of war"
ON public.fog_of_war
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND (
      gs.dm_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM session_players sp
        WHERE sp.session_id = gs.id 
        AND sp.user_id = auth.uid()
      )
    )
  )
);