-- Исправляем бесконечную рекурсию в политиках session_players
-- Удаляем существующие политики с проблемами
DROP POLICY IF EXISTS "DM может управлять игроками" ON public.session_players;
DROP POLICY IF EXISTS "Участники сессии могут видеть других игроков" ON public.session_players;

-- Создаем новые безопасные политики
CREATE POLICY "DM can manage session players"
ON public.session_players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = session_players.session_id
    AND gs.dm_user_id = auth.uid()
  )
);

CREATE POLICY "Players can view session players"
ON public.session_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions gs
    WHERE gs.id = session_players.session_id
    AND (
      gs.dm_user_id = auth.uid()
      OR session_players.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Players can join sessions"
ON public.session_players
FOR INSERT
WITH CHECK (user_id = auth.uid());