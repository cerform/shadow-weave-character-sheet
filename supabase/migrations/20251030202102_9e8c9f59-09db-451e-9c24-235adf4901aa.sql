-- Исправление бесконечной рекурсии в battle_tokens
-- Создаем security definer функцию для проверки владельца родительского токена

-- Создаем функцию для проверки владельца родительского токена
CREATE OR REPLACE FUNCTION public.is_parent_token_owner(_summoned_by uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.battle_tokens
    WHERE id = _summoned_by
      AND owner_id = _user_id
  )
$$;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Игроки могут создавать свои токен" ON public.battle_tokens;
DROP POLICY IF EXISTS "Игроки могут удалять свои токены" ON public.battle_tokens;
DROP POLICY IF EXISTS "Игроки могут управлять своими ток" ON public.battle_tokens;

-- Создаем исправленные политики с использованием security definer функции
CREATE POLICY "Игроки могут создавать свои токены"
ON public.battle_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() 
  OR (
    is_summoned = true 
    AND public.is_parent_token_owner(summoned_by, auth.uid())
  )
);

CREATE POLICY "Игроки могут удалять свои токены"
ON public.battle_tokens
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR public.is_parent_token_owner(summoned_by, auth.uid())
);

CREATE POLICY "Игроки могут управлять своими токенами"
ON public.battle_tokens
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR public.is_parent_token_owner(summoned_by, auth.uid())
)
WITH CHECK (
  owner_id = auth.uid() 
  OR public.is_parent_token_owner(summoned_by, auth.uid())
);