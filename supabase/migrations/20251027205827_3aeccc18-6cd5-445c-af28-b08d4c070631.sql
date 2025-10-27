-- Включаем REPLICA IDENTITY FULL для полного отслеживания изменений
-- Это гарантирует, что в real-time события будут включены все данные строки
ALTER TABLE public.session_players REPLICA IDENTITY FULL;
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.battle_maps REPLICA IDENTITY FULL;
ALTER TABLE public.battle_tokens REPLICA IDENTITY FULL;
ALTER TABLE public.session_messages REPLICA IDENTITY FULL;