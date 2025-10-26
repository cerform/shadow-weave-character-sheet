-- Мигрируем функционал dm_sessions в game_sessions
-- Добавляем поле current_map_url в game_sessions если его нет
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS current_map_url TEXT;

-- Копируем данные из dm_sessions в game_sessions (если есть совпадающие ID)
UPDATE game_sessions gs
SET current_map_url = ds.current_map_url
FROM dm_sessions ds
WHERE gs.id = ds.id AND ds.current_map_url IS NOT NULL;

-- Обновляем RLS политики для game_sessions чтобы включить просмотр карты
-- Политика уже есть, ничего не делаем

-- Включаем realtime для game_sessions (если еще не включено)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'game_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
  END IF;
END $$;

-- Убеждаемся что у таблицы правильная replica identity для realtime
ALTER TABLE game_sessions REPLICA IDENTITY FULL;