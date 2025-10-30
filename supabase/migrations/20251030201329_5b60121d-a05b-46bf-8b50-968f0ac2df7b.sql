-- Исправление бесконечной рекурсии в RLS политиках для battle_tokens
-- Проблема: в политиках используется parent.summoned_by вместо battle_tokens.summoned_by

-- Удаляем старые политики с ошибками
DROP POLICY IF EXISTS "Игроки могут создавать свои токен" ON public.battle_tokens;
DROP POLICY IF EXISTS "Игроки могут удалять свои токены" ON public.battle_tokens;
DROP POLICY IF EXISTS "Игроки могут управлять своими ток" ON public.battle_tokens;

-- Создаем исправленные политики
CREATE POLICY "Игроки могут создавать свои токены"
ON public.battle_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() 
  OR (
    is_summoned = true 
    AND EXISTS (
      SELECT 1 FROM battle_tokens parent 
      WHERE parent.id = battle_tokens.summoned_by 
      AND parent.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Игроки могут удалять свои токены"
ON public.battle_tokens
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
);

CREATE POLICY "Игроки могут управлять своими токенами"
ON public.battle_tokens
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
)
WITH CHECK (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM battle_tokens parent 
    WHERE parent.id = battle_tokens.summoned_by 
    AND parent.owner_id = auth.uid()
  )
);