-- Включаем realtime для таблицы battle_entities
ALTER TABLE battle_entities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_entities;