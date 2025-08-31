-- Enable realtime for session-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE session_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_maps;
ALTER PUBLICATION supabase_realtime ADD TABLE session_players;

-- Set replica identity to capture full row data for realtime updates
ALTER TABLE session_messages REPLICA IDENTITY FULL;
ALTER TABLE game_sessions REPLICA IDENTITY FULL;
ALTER TABLE battle_tokens REPLICA IDENTITY FULL;
ALTER TABLE battle_maps REPLICA IDENTITY FULL;
ALTER TABLE session_players REPLICA IDENTITY FULL;