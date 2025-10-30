-- Enable realtime for fog_of_war table
ALTER TABLE fog_of_war REPLICA IDENTITY FULL;

-- Add fog_of_war to realtime publication (if not already added)
DO $$
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'fog_of_war'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE fog_of_war;
  END IF;
END $$;