-- Создаем таблицы для автоматизированной системы спавна монстров

-- Бестиарий с каноническими статами D&D 5e
CREATE TABLE public.bestiary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  creature_type TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan')),
  ac INTEGER NOT NULL,
  hp_average INTEGER NOT NULL,
  hp_formula TEXT,
  speed_walk INTEGER DEFAULT 30,
  speed_fly INTEGER,
  speed_swim INTEGER,
  speed_burrow INTEGER,
  speed_climb INTEGER,
  cr_or_level TEXT NOT NULL,
  str_score INTEGER DEFAULT 10,
  dex_score INTEGER DEFAULT 10,
  con_score INTEGER DEFAULT 10,
  int_score INTEGER DEFAULT 10,
  wis_score INTEGER DEFAULT 10,
  cha_score INTEGER DEFAULT 10,
  traits TEXT[], -- массив описаний способностей
  actions TEXT[], -- массив описаний действий
  legendary_actions TEXT[],
  reactions TEXT[],
  languages TEXT,
  senses TEXT,
  damage_immunities TEXT[],
  damage_resistances TEXT[],
  damage_vulnerabilities TEXT[],
  condition_immunities TEXT[],
  skills JSONB, -- {"perception": 4, "stealth": 6}
  saving_throws JSONB, -- {"dex": 3, "wis": 2}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Реестр 3D моделей
CREATE TABLE public.model_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  model_url TEXT NOT NULL,
  scale REAL DEFAULT 1.0,
  y_offset REAL DEFAULT 0.0,
  animations JSONB, -- {"idle": "Idle", "walk": "Walk", "attack": "Attack_01"}
  preview_url TEXT,
  author TEXT,
  license TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Живые сущности на карте (для синхронизации между игроками)
CREATE TABLE public.battle_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  model_url TEXT NOT NULL,
  pos_x REAL NOT NULL DEFAULT 0,
  pos_y REAL NOT NULL DEFAULT 0,
  pos_z REAL NOT NULL DEFAULT 0,
  rot_y REAL NOT NULL DEFAULT 0,
  scale REAL NOT NULL DEFAULT 1.0,
  hp_current INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  ac INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  size TEXT NOT NULL,
  level_or_cr TEXT NOT NULL,
  creature_type TEXT NOT NULL,
  statuses TEXT[] DEFAULT '{}',
  is_player_character BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_battle_entities_created_by 
    FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.bestiary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.battle_entities ENABLE ROW LEVEL SECURITY;

-- Политики для бестиария (читать могут все аутентифицированные)
CREATE POLICY "Bestiary readable by authenticated users" 
  ON public.bestiary FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Bestiary writable by admins" 
  ON public.bestiary FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Политики для реестра моделей
CREATE POLICY "Model registry readable by authenticated users" 
  ON public.model_registry FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Model registry writable by admins" 
  ON public.model_registry FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Политики для боевых сущностей
CREATE POLICY "Battle entities readable by authenticated users" 
  ON public.battle_entities FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Battle entities writable by creator" 
  ON public.battle_entities FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Battle entities updatable by creator" 
  ON public.battle_entities FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Battle entities deletable by creator" 
  ON public.battle_entities FOR DELETE 
  USING (auth.uid() = created_by);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_bestiary_updated_at
  BEFORE UPDATE ON public.bestiary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_model_registry_updated_at
  BEFORE UPDATE ON public.model_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_battle_entities_updated_at
  BEFORE UPDATE ON public.battle_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Включаем реалтайм для battle_entities
ALTER TABLE public.battle_entities REPLICA IDENTITY FULL;

-- Добавляем тестовые данные
INSERT INTO public.bestiary (slug, name, creature_type, size, ac, hp_average, hp_formula, speed_walk, cr_or_level, str_score, dex_score, con_score, int_score, wis_score, cha_score) VALUES
  ('goblin', 'Гоблин', 'гуманоид (гоблиноид)', 'Small', 15, 7, '2d6', 30, 'CR 1/4', 8, 14, 10, 10, 8, 8),
  ('orc', 'Орк', 'гуманоид (орк)', 'Medium', 13, 15, '2d8+2', 30, 'CR 1/2', 16, 12, 13, 7, 11, 10),
  ('ogre', 'Огр', 'великан', 'Large', 11, 59, '7d10+21', 40, 'CR 2', 19, 8, 16, 5, 7, 7),
  ('wolf', 'Волк', 'зверь', 'Medium', 13, 11, '2d8+2', 40, 'CR 1/4', 12, 15, 12, 3, 12, 6),
  ('skeleton', 'Скелет', 'нежить', 'Medium', 13, 13, '2d8+4', 30, 'CR 1/4', 10, 14, 15, 6, 8, 5);

INSERT INTO public.model_registry (slug, model_url, scale, y_offset, animations) VALUES
  ('goblin', 'https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/goblin.glb', 0.9, 0, '{"idle": "Idle", "walk": "Walk", "attack": "Attack"}'),
  ('orc', 'https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/orc.glb', 1.0, 0, '{"idle": "Idle", "walk": "Walk", "attack": "Attack"}'),
  ('ogre', 'https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/ogre.glb', 1.2, 0, '{"idle": "Idle", "walk": "Walk", "attack": "Attack"}'),
  ('wolf', 'https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/wolf.glb', 0.8, 0, '{"idle": "Idle", "walk": "Walk", "attack": "Attack"}'),
  ('skeleton', 'https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/skeleton.glb', 1.0, 0, '{"idle": "Idle", "walk": "Walk", "attack": "Attack"}');