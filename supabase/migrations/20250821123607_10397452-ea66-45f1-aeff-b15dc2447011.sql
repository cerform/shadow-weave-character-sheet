-- Обновляем политику доступа к SRD существам
-- SRD данные должны быть доступны всем пользователям (публичные данные D&D)

DROP POLICY IF EXISTS "srd_creatures_select_auth" ON public.srd_creatures;

-- Создаем новую политику, разрешающую чтение всем
CREATE POLICY "srd_creatures_select_public" 
ON public.srd_creatures 
FOR SELECT 
USING (true);

-- Оставляем админскую политику для записи
-- (политика srd_creatures_admin_all уже существует)