-- Create a table to store user code for challenges
-- This allows for persistent, multi-device access to user progress

CREATE TABLE IF NOT EXISTS public.user_challenge_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id TEXT NOT NULL,
    files_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one record per user per challenge
    UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_challenge_files ENABLE ROW LEVEL SECURITY;

-- Policies for user access
CREATE POLICY "Users can view their own challenge files" 
ON public.user_challenge_files FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own challenge files" 
ON public.user_challenge_files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge files" 
ON public.user_challenge_files FOR UPDATE 
USING (auth.uid() = user_id);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_user_challenge_files_composite ON public.user_challenge_files(user_id, challenge_id);
