-- Refine RLS policies for AI DM system
-- Allow all session members (DM and Players) to read and write campaign data
-- This is necessary because AI processing (AIDMService) runs on the client side 
-- of whoever performs an action.

-- 1. campaign_context
DROP POLICY IF EXISTS "session_members_read_context" ON campaign_context;
DROP POLICY IF EXISTS "dm_manage_context" ON campaign_context;
DROP POLICY IF EXISTS "service_role_write_context" ON campaign_context;

CREATE POLICY "session_members_read_context" ON campaign_context
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_context.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "session_members_manage_context" ON campaign_context
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_context.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

-- 2. campaign_events
DROP POLICY IF EXISTS "session_members_read_events" ON campaign_events;
DROP POLICY IF EXISTS "dm_manage_events" ON campaign_events;
DROP POLICY IF EXISTS "service_role_write_events" ON campaign_events;

CREATE POLICY "session_members_read_events" ON campaign_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_events.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "session_members_manage_events" ON campaign_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_events.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

-- 3. campaign_memory
DROP POLICY IF EXISTS "session_members_read_memory" ON campaign_memory;
DROP POLICY IF EXISTS "dm_manage_memory" ON campaign_memory;
DROP POLICY IF EXISTS "session_members_can_read_memory" ON campaign_memory;
DROP POLICY IF EXISTS "dm_can_write_memory" ON campaign_memory;

CREATE POLICY "session_members_read_memory" ON campaign_memory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_memory.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "session_members_manage_memory" ON campaign_memory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_memory.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

-- 4. ai_assets
DROP POLICY IF EXISTS "session_members_read_assets" ON ai_assets;
DROP POLICY IF EXISTS "dm_manage_assets" ON ai_assets;
DROP POLICY IF EXISTS "service_role_write_assets" ON ai_assets;

CREATE POLICY "session_members_read_assets" ON ai_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = ai_assets.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "session_members_manage_assets" ON ai_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = ai_assets.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.user_id = auth.uid()
        ))
    )
  );
