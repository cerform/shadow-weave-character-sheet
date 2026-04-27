-- ============================================================
-- Shadow Weave: AI DM Memory & Context Schema
-- Migration: 20260427_ai_dm_system
-- ============================================================

-- 1. Память кампании — факты, NPC, состояние мира
CREATE TABLE IF NOT EXISTS campaign_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'world_state', 'npc', 'quest', 'event', 'lore', 'faction', 'location', 'item'
  )),
  key TEXT NOT NULL,       -- 'main_villain', 'current_location', 'party_reputation_merchants'
  value JSONB NOT NULL,    -- любые данные
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, type, key)
);

-- 2. Сжатый контекст кампании (токен-эффективность)
CREATE TABLE IF NOT EXISTS campaign_context (
  session_id UUID PRIMARY KEY REFERENCES game_sessions(id) ON DELETE CASCADE,
  campaign_name TEXT,
  world_setting TEXT,        -- краткое описание сеттинга
  short_summary TEXT,        -- последние 3-5 событий (в каждый запрос)  
  full_history JSONB DEFAULT '[]'::jsonb,   -- полная хронология
  world_facts JSONB DEFAULT '{}'::jsonb,    -- постоянные факты мира
  active_quests JSONB DEFAULT '[]'::jsonb,  -- активные квесты
  completed_quests JSONB DEFAULT '[]'::jsonb,
  npc_registry JSONB DEFAULT '{}'::jsonb,   -- все NPC { name: {status, relationship, location} }
  party_info JSONB DEFAULT '[]'::jsonb,     -- партия с лёгкими харк-ми
  ai_personality TEXT DEFAULT 'epic' CHECK (ai_personality IN ('epic', 'dark', 'merciless', 'rules')),
  turn_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Хронология событий кампании
CREATE TABLE IF NOT EXISTS campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  turn_number INT NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'campaign_init', 'player_action', 'dm_narration', 'combat_start',
    'combat_round', 'combat_end', 'discovery', 'npc_interaction',
    'quest_update', 'level_up', 'death', 'rest'
  )),
  actor TEXT,         -- имя персонажа или 'DM' или 'SYSTEM'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,  -- { map_id, image_url, dice_rolls, etc. }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_events_session ON campaign_events(session_id, turn_number DESC);

-- 4. AI-сгенерированные ассеты
CREATE TABLE IF NOT EXISTS ai_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'portrait', 'location', 'map', 'monster', 'item', 'banner'
  )),
  subject TEXT NOT NULL,  -- 'Zarathos the Dark Elf' / 'Dungeon of Lost Souls'
  prompt TEXT NOT NULL,
  url TEXT,               -- URL после генерации
  thumbnail_url TEXT,
  model_used TEXT,        -- 'flux-schnell' | 'sdxl'
  generation_params JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_assets_session ON ai_assets(session_id, asset_type);

-- 5. RLS policies
ALTER TABLE campaign_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assets ENABLE ROW LEVEL SECURITY;

-- Участники сессии видят её данные
CREATE POLICY "session_members_can_read_memory" ON campaign_memory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_memory.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp
          WHERE sp.session_id = gs.id AND sp.player_id = auth.uid()
        ))
    )
  );

CREATE POLICY "dm_can_write_memory" ON campaign_memory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_memory.session_id AND gs.dm_id = auth.uid()
    )
  );

-- Аналогично для остальных таблиц
CREATE POLICY "session_members_read_context" ON campaign_context
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_context.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.player_id = auth.uid()
        ))
    )
  );

CREATE POLICY "service_role_write_context" ON campaign_context
  FOR ALL TO service_role USING (true);

CREATE POLICY "session_members_read_events" ON campaign_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = campaign_events.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.player_id = auth.uid()
        ))
    )
  );

CREATE POLICY "service_role_write_events" ON campaign_events
  FOR ALL TO service_role USING (true);

CREATE POLICY "session_members_read_assets" ON ai_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = ai_assets.session_id
        AND (gs.dm_id = auth.uid() OR EXISTS (
          SELECT 1 FROM session_players sp WHERE sp.session_id = gs.id AND sp.player_id = auth.uid()
        ))
    )
  );

CREATE POLICY "service_role_write_assets" ON ai_assets
  FOR ALL TO service_role USING (true);

-- Trigger: обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_memory_updated_at
  BEFORE UPDATE ON campaign_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_context_updated_at
  BEFORE UPDATE ON campaign_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
