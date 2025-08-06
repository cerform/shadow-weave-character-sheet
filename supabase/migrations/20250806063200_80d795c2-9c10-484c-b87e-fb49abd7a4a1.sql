-- Создаем bucket для хранения карт
INSERT INTO storage.buckets (id, name, public) VALUES ('battle-maps', 'battle-maps', true);

-- Политики доступа для карт
CREATE POLICY "Карты видны всем" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'battle-maps');

CREATE POLICY "Аутентифицированные пользователи могут загружать карты" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'battle-maps' AND auth.uid() IS NOT NULL);

CREATE POLICY "Пользователи могут обновлять свои карты" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'battle-maps' AND auth.uid() IS NOT NULL);

CREATE POLICY "Пользователи могут удалять свои карты" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'battle-maps' AND auth.uid() IS NOT NULL);