-- Функция для безопасной очистки категорий ассетов
CREATE OR REPLACE FUNCTION public.clear_asset_categories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can clear asset categories';
  END IF;

  -- Используем DELETE с условием TRUE вместо без WHERE
  DELETE FROM public.asset_categories WHERE TRUE;
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$function$;

-- Обновляем функцию очистки ассетов тоже для безопасности
CREATE OR REPLACE FUNCTION public.clear_assets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can clear assets';
  END IF;

  -- Используем DELETE с условием TRUE вместо без WHERE
  DELETE FROM public.assets WHERE TRUE;
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$function$;

-- Функция для создания стандартных категорий
CREATE OR REPLACE FUNCTION public.create_standard_categories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cnt integer := 0;
  categories text[][] := ARRAY[
    ARRAY['monster', 'Монстры'],
    ARRAY['character', 'Персонаж'],
    ARRAY['structure', 'Строения'],
    ARRAY['weapon', 'Оружие'],
    ARRAY['armor', 'Одежда']
  ];
  cat text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create categories';
  END IF;

  FOREACH cat SLICE 1 IN ARRAY categories
  LOOP
    INSERT INTO public.asset_categories (key, name)
    VALUES (cat[1], cat[2])
    ON CONFLICT (key) DO NOTHING;
    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$function$;