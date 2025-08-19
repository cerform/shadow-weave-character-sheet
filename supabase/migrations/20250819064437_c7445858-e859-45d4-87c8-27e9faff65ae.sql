-- Drop existing fog_of_war table if exists
DROP TABLE IF EXISTS public.fog_of_war;

-- Create fog_of_war table with correct structure for 3D fog system
CREATE TABLE public.fog_of_war (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  map_id TEXT NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, map_id, grid_x, grid_y)
);

-- Enable RLS
ALTER TABLE public.fog_of_war ENABLE ROW LEVEL SECURITY;

-- Create policies for fog of war access
CREATE POLICY "Anyone can view fog of war" 
ON public.fog_of_war 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert fog of war cells" 
ON public.fog_of_war 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update fog of war cells" 
ON public.fog_of_war 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete fog of war cells" 
ON public.fog_of_war 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_fog_of_war_session_map ON public.fog_of_war(session_id, map_id);
CREATE INDEX idx_fog_of_war_grid ON public.fog_of_war(grid_x, grid_y);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fog_of_war_updated_at
BEFORE UPDATE ON public.fog_of_war
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();