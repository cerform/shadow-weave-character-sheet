-- Создание таблицы для персонажей D&D
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  subrace TEXT,
  class TEXT NOT NULL,
  subclass TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  -- Основные характеристики
  strength INTEGER NOT NULL DEFAULT 10,
  dexterity INTEGER NOT NULL DEFAULT 10,
  constitution INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  wisdom INTEGER NOT NULL DEFAULT 10,
  charisma INTEGER NOT NULL DEFAULT 10,
  
  -- Здоровье и защита
  max_hp INTEGER NOT NULL DEFAULT 8,
  current_hp INTEGER NOT NULL DEFAULT 8,
  armor_class INTEGER NOT NULL DEFAULT 10,
  speed INTEGER DEFAULT 30,
  proficiency_bonus INTEGER DEFAULT 2,
  
  -- Дополнительные данные (JSON)
  spells JSONB DEFAULT '[]'::jsonb,
  equipment JSONB DEFAULT '[]'::jsonb,
  money JSONB DEFAULT '{"gp": 0, "sp": 0, "cp": 0}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  hit_points JSONB DEFAULT '{"current": 8, "maximum": 8, "temporary": 0}'::jsonb,
  proficiencies JSONB DEFAULT '[]'::jsonb,
  background TEXT,
  backstory TEXT,
  alignment TEXT,
  gender TEXT,
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем Row Level Security
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Политики безопасности - пользователи могут работать только со своими персонажами
CREATE POLICY "Пользователи могут просматривать только своих персонажей" 
ON public.characters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать персонажей для себя" 
ON public.characters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять только своих персонажей" 
ON public.characters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять только своих персонажей" 
ON public.characters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_characters_name ON public.characters(name);
CREATE INDEX idx_characters_class ON public.characters(class);
CREATE INDEX idx_characters_level ON public.characters(level);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();