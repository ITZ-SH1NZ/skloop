-- Add active_powers JSONB column for boosters
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_powers JSONB DEFAULT '{}'::jsonb;

-- Comment on the column for clarity
COMMENT ON COLUMN public.profiles.active_powers IS 'Tracks active boosters like XP multipliers and their expiration timestamps.';
