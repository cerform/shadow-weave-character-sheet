-- Drop existing fog_of_war table if it exists
DROP TABLE IF EXISTS public.fog_of_war;

-- Create new fog_of_war table with proper UUID handling
CREATE TABLE public.fog_of_war (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  map_id UUID NOT NULL DEFAULT gen_random_uuid(),
  fog_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fog_of_war ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Allow all access to fog_of_war for authenticated users" 
ON public.fog_of_war 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_fog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fog_updated_at
  BEFORE UPDATE ON public.fog_of_war
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fog_updated_at();

-- Enable realtime for fog_of_war table
ALTER TABLE public.fog_of_war REPLICA IDENTITY FULL;
INSERT INTO supabase_realtime.subscription (entity, filters) VALUES ('public.fog_of_war', 'eq.session_id:*');