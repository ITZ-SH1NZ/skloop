-- Daily Quest Completions Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.daily_quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quest_id TEXT NOT NULL, -- 'login', 'codele', etc.
    completed_at DATE DEFAULT CURRENT_DATE,
    xp_awarded INTEGER DEFAULT 0,
    coins_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, quest_id, completed_at)
);

ALTER TABLE public.daily_quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quest completions."
    ON daily_quest_completions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest completions."
    ON daily_quest_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_quest_completions_user_date
    ON daily_quest_completions(user_id, completed_at);
