-- Удаляем проблемные политики
DROP POLICY IF EXISTS "DM может управлять своими сессиями" ON public.game_sessions;
DROP POLICY IF EXISTS "Игроки могут видеть сессии где уча" ON public.game_sessions;

-- Создаем security definer функцию для проверки DM
CREATE OR REPLACE FUNCTION public.is_user_dm_of_session(_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.game_sessions 
    WHERE id = _session_id AND dm_id = auth.uid()
  )
$$;

-- Создаем security definer функцию для проверки участника сессии  
CREATE OR REPLACE FUNCTION public.is_user_participant_of_session(_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.session_players 
    WHERE session_id = _session_id AND user_id = auth.uid()
  )
$$;

-- Создаем новые политики без рекурсии
CREATE POLICY "DM может управлять своими сессиями" 
ON public.game_sessions
FOR ALL
TO authenticated
USING (auth.uid() = dm_id)
WITH CHECK (auth.uid() = dm_id);

CREATE POLICY "Игроки могут видеть сессии где участвуют" 
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
  auth.uid() = dm_id OR 
  public.is_user_participant_of_session(id)
);