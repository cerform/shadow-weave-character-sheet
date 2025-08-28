-- Удаляем функцию генерации изображений монстров
DROP FUNCTION IF EXISTS public.generate_monster_image(TEXT, TEXT, TEXT);