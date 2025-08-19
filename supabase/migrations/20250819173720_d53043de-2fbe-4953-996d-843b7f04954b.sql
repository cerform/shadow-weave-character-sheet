-- Fix security vulnerability in fog_of_war table
-- Drop existing permissive policies that allow anonymous access
DROP POLICY IF EXISTS "Anyone can view fog of war" ON public.fog_of_war;
DROP POLICY IF EXISTS "Anyone can insert fog of war cells" ON public.fog_of_war;
DROP POLICY IF EXISTS "Anyone can update fog of war cells" ON public.fog_of_war;
DROP POLICY IF EXISTS "Anyone can delete fog of war cells" ON public.fog_of_war;

-- Create secure RLS policies that require authentication and session participation

-- DMs can manage fog of war for their sessions
CREATE POLICY "DM can manage fog of war for their sessions"
ON public.fog_of_war
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.game_sessions gs 
    WHERE gs.id::text = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.game_sessions gs 
    WHERE gs.id::text = fog_of_war.session_id 
    AND gs.dm_id = auth.uid()
  )
);

-- Session participants can view fog of war data
CREATE POLICY "Session participants can view fog of war"
ON public.fog_of_war
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.game_sessions gs 
    WHERE gs.id::text = fog_of_war.session_id 
    AND (
      gs.dm_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM public.session_players sp 
        WHERE sp.session_id = gs.id 
        AND sp.user_id = auth.uid()
      )
    )
  )
);