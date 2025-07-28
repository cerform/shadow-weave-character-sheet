-- Обновляем остальные политики для требования аутентификации

-- Политики для battle_tokens
DROP POLICY IF EXISTS "Участники сессии могут видеть токены" ON public.battle_tokens;
DROP POLICY IF EXISTS "DM может управлять токенами" ON public.battle_tokens;
DROP POLICY IF EXISTS "Игроки могут перемещать свои токены" ON public.battle_tokens;

CREATE POLICY "Участники сессии могут видеть токены"
ON public.battle_tokens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_tokens.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = battle_tokens.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND (is_hidden_from_players = false OR 
         EXISTS (SELECT 1 FROM public.game_sessions 
                WHERE game_sessions.id = battle_tokens.session_id 
                AND game_sessions.dm_id = auth.uid()))
);

CREATE POLICY "DM может управлять токенами"
ON public.battle_tokens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_tokens.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

CREATE POLICY "Игроки могут перемещать свои токены"
ON public.battle_tokens
FOR UPDATE
TO authenticated
USING (
  character_id IN (
    SELECT characters.id FROM public.characters 
    WHERE characters.user_id = auth.uid()
  )
);

-- Политики для initiative_tracker
DROP POLICY IF EXISTS "Участники сессии могут видеть инициативу" ON public.initiative_tracker;
DROP POLICY IF EXISTS "DM может управлять инициативой" ON public.initiative_tracker;

CREATE POLICY "Участники сессии могут видеть инициативу"
ON public.initiative_tracker
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = initiative_tracker.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = initiative_tracker.session_id 
                AND session_players.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять инициативой"
ON public.initiative_tracker
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = initiative_tracker.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Политики для session_messages
DROP POLICY IF EXISTS "Участники сессии могут видеть сообщения" ON public.session_messages;
DROP POLICY IF EXISTS "Участники сессии могут отправлять сообщения" ON public.session_messages;

CREATE POLICY "Участники сессии могут видеть сообщения"
ON public.session_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_messages.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = session_messages.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND (is_whisper = false OR whisper_to_user_id = auth.uid() OR user_id = auth.uid())
);

CREATE POLICY "Участники сессии могут отправлять сообщения"
ON public.session_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_messages.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = session_messages.session_id 
                AND session_players.user_id = auth.uid()))
  ) AND user_id = auth.uid()
);

-- Политики для fog_of_war
DROP POLICY IF EXISTS "DM может управлять туманом войны" ON public.fog_of_war;
DROP POLICY IF EXISTS "Игроки могут видеть открытые области" ON public.fog_of_war;

CREATE POLICY "DM может управлять туманом войны"
ON public.fog_of_war
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = fog_of_war.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

CREATE POLICY "Игроки могут видеть открытые области"
ON public.fog_of_war
FOR SELECT
TO authenticated
USING (
  is_revealed = true AND
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = fog_of_war.session_id 
    AND EXISTS (SELECT 1 FROM public.session_players 
               WHERE session_players.session_id = fog_of_war.session_id 
               AND session_players.user_id = auth.uid())
  )
);

-- Обновляем политики для characters (старые)
DROP POLICY IF EXISTS "Пользователи могут обновлять толь" ON public.characters;
DROP POLICY IF EXISTS "Пользователи могут просматривать " ON public.characters;
DROP POLICY IF EXISTS "Пользователи могут удалять только" ON public.characters;
DROP POLICY IF EXISTS "Пользователи могут создавать перс" ON public.characters;

CREATE POLICY "Пользователи могут просматривать своих персонажей"
ON public.characters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать персонажей"
ON public.characters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять своих персонажей"
ON public.characters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять своих персонажей"
ON public.characters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);