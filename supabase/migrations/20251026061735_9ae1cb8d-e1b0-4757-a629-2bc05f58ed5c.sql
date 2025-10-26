-- Fix 1: Add owner_id column to character_models and update RLS policies
ALTER TABLE public.character_models 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing records to have a valid owner (first admin or first user)
UPDATE public.character_models 
SET created_by = (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Only authenticated users can update character models" ON public.character_models;
DROP POLICY IF EXISTS "Only authenticated users can insert character models" ON public.character_models;

-- Create new restrictive policies with ownership validation
CREATE POLICY "Users can update their own character models"
ON public.character_models
FOR UPDATE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own character models"
ON public.character_models
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own character models"
ON public.character_models
FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Fix 2: Verify and tighten profiles RLS policies
-- The profiles table already has policies, but let's ensure they are strict

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate strict ownership-based policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));