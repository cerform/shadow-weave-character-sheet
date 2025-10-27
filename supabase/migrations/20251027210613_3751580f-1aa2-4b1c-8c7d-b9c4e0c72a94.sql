-- Добавляем политику чтобы DM мог видеть персонажей игроков в своих сессиях
CREATE POLICY "DM может видеть персонажей игроков своих сессий"
ON public.characters
FOR SELECT
USING (
  -- Пользователь может видеть своих персонажей
  auth.uid() = user_id
  OR
  -- DM может видеть персонажей игроков в своих сессиях
  EXISTS (
    SELECT 1
    FROM public.session_players sp
    JOIN public.game_sessions gs ON gs.id = sp.session_id
    WHERE sp.character_id = characters.id
      AND gs.dm_id = auth.uid()
  )
);