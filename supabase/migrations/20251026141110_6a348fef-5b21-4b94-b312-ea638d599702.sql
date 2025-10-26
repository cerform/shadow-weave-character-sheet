-- Добавляем поля для управления токенами
ALTER TABLE battle_tokens 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS summoned_by UUID REFERENCES battle_tokens(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_summoned BOOLEAN DEFAULT false;

-- Обновляем RLS политики для управления токенами
DROP POLICY IF EXISTS "Игроки могут перемещать свои токе" ON battle_tokens;

CREATE POLICY "Игроки могут управлять своими токенами и призванными"
ON battle_tokens
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
)
WITH CHECK (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
);

-- Политика для создания токенов игроками (свои токены и призванные)
CREATE POLICY "Игроки могут создавать свои токены"
ON battle_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR
  (is_summoned = true AND EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = summoned_by 
    AND parent.owner_id = auth.uid()
  ))
);

-- Политика для удаления своих токенов
CREATE POLICY "Игроки могут удалять свои токены"
ON battle_tokens
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
);