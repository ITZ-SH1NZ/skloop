-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds hourly_rate (in SKLOOP coins) to mentor profiles

ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0;

-- Ensure profile update is allowed for mentoring fields
DROP POLICY IF EXISTS "Mentors can update own profile" ON public.mentor_profiles;
CREATE POLICY "Mentors can update own profile" ON public.mentor_profiles 
FOR UPDATE USING (auth.uid() = id);
