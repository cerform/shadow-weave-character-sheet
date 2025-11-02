-- Обновляем RLS политики для error_logs, чтобы разрешить логирование от ВСЕХ пользователей (включая неавторизованных)

-- Удаляем старую политику INSERT
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON error_logs;

-- Создаем новую политику INSERT для ВСЕХ (включая анонимных пользователей)
CREATE POLICY "Anyone can insert error logs"
  ON error_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Комментарий для документации
COMMENT ON POLICY "Anyone can insert error logs" ON error_logs IS 
'Разрешает логирование ошибок для всех пользователей, включая неавторизованных. Это необходимо для отслеживания ошибок на стороне клиента.';
