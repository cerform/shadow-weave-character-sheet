-- Ensure fog_of_war has REPLICA IDENTITY FULL for realtime updates
ALTER TABLE fog_of_war REPLICA IDENTITY FULL;