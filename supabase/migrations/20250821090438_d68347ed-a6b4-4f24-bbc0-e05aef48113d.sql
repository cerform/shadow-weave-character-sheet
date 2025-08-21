-- Создаем стандартные категории для ассетов если их нет
INSERT INTO public.asset_categories (key, name) VALUES
('monster', 'Монстры'),
('boss', 'Босы'),
('character', 'Персонажи'),
('structure', 'Строения'),
('weapon', 'Оружие'),
('armor', 'Броня')
ON CONFLICT (key) DO NOTHING;

-- Обновляем таблицу srd_creatures для поддержки 3D моделей
ALTER TABLE public.srd_creatures 
ADD COLUMN IF NOT EXISTS model_url TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT;