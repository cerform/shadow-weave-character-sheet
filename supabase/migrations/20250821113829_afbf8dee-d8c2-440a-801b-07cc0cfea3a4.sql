-- Создаем тестовую сессию для демо
INSERT INTO game_sessions (
  id,
  dm_id,
  name,
  description,
  session_code,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000', 
  'Демо Сессия',
  'Тестовая сессия для демонстрации',
  'DEMO01',
  true
) ON CONFLICT (id) DO NOTHING;