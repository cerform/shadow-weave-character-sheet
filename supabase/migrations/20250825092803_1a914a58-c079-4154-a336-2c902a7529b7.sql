-- SECURITY FIX: Database hardening - fix search_path in security definer functions
-- This prevents SQL injection and privilege escalation through function calls

-- Update existing security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.is_user_dm_of_session(_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.game_sessions 
    WHERE id = _session_id AND dm_id = auth.uid()
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_user_participant_of_session(_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.session_players 
    WHERE session_id = _session_id AND user_id = auth.uid()
  )
$function$;

CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Генерируем 6-символьный код
        code := upper(substr(md5(random()::text), 1, 6));
        
        -- Проверяем, существует ли уже такой код
        SELECT EXISTS(SELECT 1 FROM public.game_sessions WHERE session_code = code AND is_active = true)
        INTO code_exists;
        
        -- Если код уникален, выходим из цикла
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$function$;

-- Add audit logging for role changes (security monitoring)
CREATE TABLE IF NOT EXISTS public.role_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    target_user_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('assign', 'remove')),
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.role_audit_log
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.role_audit_log (user_id, target_user_id, action, role)
        VALUES (auth.uid(), NEW.user_id, 'assign', NEW.role);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.role_audit_log (user_id, target_user_id, action, role)
        VALUES (auth.uid(), OLD.user_id, 'remove', OLD.role);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;

-- Create triggers for role audit logging
DROP TRIGGER IF EXISTS user_roles_audit_insert ON public.user_roles;
DROP TRIGGER IF EXISTS user_roles_audit_delete ON public.user_roles;

CREATE TRIGGER user_roles_audit_insert
    AFTER INSERT ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

CREATE TRIGGER user_roles_audit_delete
    AFTER DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();