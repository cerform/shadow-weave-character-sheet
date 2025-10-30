-- Сначала удаляем все политики для fog_of_war
DROP POLICY IF EXISTS "Session participants can view fog of war" ON fog_of_war;
DROP POLICY IF EXISTS "DM can manage fog of war for their sessions" ON fog_of_war;

-- Удаляем невалидные записи с текстовыми session_id (например, 'current-session')
DELETE FROM fog_of_war 
WHERE session_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Теперь можем изменить тип session_id на uuid
ALTER TABLE fog_of_war 
ALTER COLUMN session_id TYPE uuid USING session_id::uuid;

-- Создаём политики заново с правильными типами
CREATE POLICY "Session participants can view fog of war" 
ON fog_of_war 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND (
      gs.dm_id = auth.uid() 
      OR EXISTS (
        SELECT 1
        FROM session_players sp
        WHERE sp.session_id = gs.id 
        AND sp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "DM can manage fog of war for their sessions" 
ON fog_of_war 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM game_sessions gs
    WHERE gs.id = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
);