-- Create edge function for image generation
CREATE OR REPLACE FUNCTION public.generate_monster_image(
  monster_name TEXT,
  monster_category TEXT,
  prompt_description TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  generated_prompt TEXT;
BEGIN
  -- Создаем промпт на основе названия и категории монстра
  IF prompt_description IS NOT NULL THEN
    generated_prompt := prompt_description;
  ELSE
    generated_prompt := 'Fantasy ' || monster_category || ' creature ' || monster_name || ', detailed fantasy art, round token format, high detail, dark fantasy style';
  END IF;
  
  -- Возвращаем промпт для генерации (сама генерация будет в edge function)
  RETURN generated_prompt;
END;
$$;