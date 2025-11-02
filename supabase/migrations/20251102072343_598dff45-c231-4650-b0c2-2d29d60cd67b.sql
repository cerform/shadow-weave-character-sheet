-- Создаем enum для категорий ошибок
CREATE TYPE error_category AS ENUM (
  'frontend',
  'backend',
  'database',
  'auth',
  'api',
  'network',
  'other'
);

-- Создаем enum для уровней серьезности
CREATE TYPE error_severity AS ENUM (
  'info',
  'warning',
  'error',
  'critical'
);

-- Таблица для хранения логов ошибок
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category error_category NOT NULL DEFAULT 'other',
  severity error_severity NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Политика: только админы могут читать логи
CREATE POLICY "Admins can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Политика: все аутентифицированные пользователи могут создавать логи
CREATE POLICY "Authenticated users can create error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Политика: только админы могут обновлять логи (помечать как resolved)
CREATE POLICY "Admins can update error logs"
  ON public.error_logs
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Политика: только админы могут удалять логи
CREATE POLICY "Admins can delete error logs"
  ON public.error_logs
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Триггер для обновления updated_at
CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для быстрого поиска
CREATE INDEX idx_error_logs_category ON public.error_logs(category);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);

-- Функция для автоматической очистки старых логов (старше 90 дней)
CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND resolved = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;