-- Исправляем функции с security definer и search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Генерируем 6-символьный код
        code := upper(substr(md5(random()::text), 1, 6));
        
        -- Проверяем, существует ли уже такой код
        SELECT EXISTS(SELECT 1 FROM public.game_sessions WHERE session_code = code AND is_active = true)
        INTO code_exists;
        
        -- Если код уникален, выходим из цикла
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Добавляем политики для анонимных пользователей только для аутентифицированных
-- Обновляем политики, чтобы они требовали аутентификации

-- Удаляем старые политики, которые могут конфликтовать
DROP POLICY IF EXISTS "DM может управлять своими сессиями" ON public.game_sessions;
DROP POLICY IF EXISTS "Игроки могут видеть сессии где участвуют" ON public.game_sessions;

-- Создаем новые политики только для аутентифицированных пользователей
CREATE POLICY "DM может управлять своими сессиями"
ON public.game_sessions
FOR ALL
TO authenticated
USING (auth.uid() = dm_id);

CREATE POLICY "Игроки могут видеть сессии где участвуют"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_players 
    WHERE session_players.session_id = game_sessions.id 
    AND session_players.user_id = auth.uid()
  )
);

-- Обновляем политики для других таблиц
DROP POLICY IF EXISTS "Участники сессии могут видеть других игроков" ON public.session_players;
DROP POLICY IF EXISTS "DM может управлять игроками" ON public.session_players;

CREATE POLICY "Участники сессии могут видеть других игроков"
ON public.session_players
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_players.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players sp2 
                WHERE sp2.session_id = session_players.session_id 
                AND sp2.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять игроками"
ON public.session_players
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = session_players.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Аналогично для остальных таблиц
DROP POLICY IF EXISTS "Участники сессии могут видеть карты" ON public.battle_maps;
DROP POLICY IF EXISTS "DM может управлять картами" ON public.battle_maps;

CREATE POLICY "Участники сессии могут видеть карты"
ON public.battle_maps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_maps.session_id 
    AND (game_sessions.dm_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.session_players 
                WHERE session_players.session_id = battle_maps.session_id 
                AND session_players.user_id = auth.uid()))
  )
);

CREATE POLICY "DM может управлять картами"
ON public.battle_maps
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE game_sessions.id = battle_maps.session_id 
    AND game_sessions.dm_id = auth.uid()
  )
);

-- Добавляем функцию присоединения к сессии
CREATE OR REPLACE FUNCTION join_session(session_code_param TEXT, player_name_param TEXT, character_id_param UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    session_record RECORD;
    player_id UUID;
BEGIN
    -- Проверяем, что пользователь аутентифицирован
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Необходима аутентификация';
    END IF;
    
    -- Находим активную сессию по коду
    SELECT * INTO session_record 
    FROM public.game_sessions 
    WHERE session_code = session_code_param AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Сессия с кодом % не найдена или неактивна', session_code_param;
    END IF;
    
    -- Проверяем, не превышен ли лимит игроков
    IF (SELECT COUNT(*) FROM public.session_players WHERE session_id = session_record.id) >= session_record.max_players THEN
        RAISE EXCEPTION 'Достигнут максимум игроков для сессии';
    END IF;
    
    -- Добавляем игрока или обновляем если уже существует
    INSERT INTO public.session_players (session_id, user_id, character_id, player_name)
    VALUES (session_record.id, auth.uid(), character_id_param, player_name_param)
    ON CONFLICT (session_id, user_id) 
    DO UPDATE SET 
        character_id = character_id_param,
        player_name = player_name_param,
        is_online = true,
        last_seen = now()
    RETURNING id INTO player_id;
    
    RETURN session_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';