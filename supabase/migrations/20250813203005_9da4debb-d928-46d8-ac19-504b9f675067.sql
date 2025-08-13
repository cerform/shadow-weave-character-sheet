-- Обновляем функцию создания стандартных категорий
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
    ARRAY['boss', 'Босы'],
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