-- Migration: Add joined_at to profiles and backfill from auth.users
-- Description: Ensures all users (past and future) have a reliable joined_at date.

-- 1. Add the column to profiles if it doesn't already exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='joined_at') THEN
        ALTER TABLE public.profiles ADD COLUMN joined_at timestamp with time zone;
    END IF;
END $$;

-- 2. Backfill existing users by joining with the internal auth.users table
-- This is where the source of truth for "Created At" lives.
UPDATE public.profiles p
SET joined_at = u.created_at
FROM auth.users u
WHERE p.id = u.id
AND p.joined_at IS NULL;

-- 3. Update the handle_new_user function to include joined_at for all future signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, joined_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username',
    new.created_at -- This syncs from the auth.users timestamp
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set a default for joined_at just in case (though the trigger handles it)
ALTER TABLE public.profiles ALTER COLUMN joined_at SET DEFAULT now();
