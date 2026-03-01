-- ==========================================
-- 1. QUEST DEFINITIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,            -- e.g., 'codele', 'login', 'codele_3w'
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) NOT NULL,
    xp_reward INT DEFAULT 0,
    coins_reward INT DEFAULT 0,
    icon TEXT,                           -- lucide icon name
    sort_order INT DEFAULT 0
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are viewable by everyone." ON quests FOR SELECT USING ( true );

-- ==========================================
-- 2. USER QUEST COMPLETIONS (EXTENDED)
-- ==========================================

-- Extend the existing daily_quest_completions table to handle weeklies/monthlies and progress
ALTER TABLE public.daily_quest_completions
    ADD COLUMN IF NOT EXISTS cycle_key TEXT,
    ADD COLUMN IF NOT EXISTS quest_type TEXT DEFAULT 'daily',
    ADD COLUMN IF NOT EXISTS auto_progress INT DEFAULT 0; -- For background tracking (e.g., 2/3 done)

-- Drop the old unique constraint and add a new one that includes cycle_key
ALTER TABLE public.daily_quest_completions DROP CONSTRAINT IF EXISTS daily_quest_completions_user_id_quest_id_completed_at_key;
ALTER TABLE public.daily_quest_completions DROP CONSTRAINT IF EXISTS unique_user_quest_cycle;
ALTER TABLE public.daily_quest_completions ADD CONSTRAINT unique_user_quest_cycle UNIQUE(user_id, quest_id, cycle_key);

-- Make sure the table exists at all if the user missed it previously
CREATE TABLE IF NOT EXISTS public.daily_quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quest_id TEXT NOT NULL,
    completed_at DATE DEFAULT CURRENT_DATE,
    xp_awarded INTEGER DEFAULT 0,
    coins_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    cycle_key TEXT,
    quest_type TEXT DEFAULT 'daily',
    auto_progress INT DEFAULT 0,
    CONSTRAINT unique_user_quest_cycle UNIQUE(user_id, quest_id, cycle_key)
);

-- ==========================================
-- 3. USER CHESTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_chests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chest_type TEXT CHECK (chest_type IN ('common', 'rare', 'legendary')) NOT NULL,
    cycle_key TEXT NOT NULL,             -- e.g., 'daily:2026-03-01'
    status TEXT DEFAULT 'sealed' CHECK (status IN ('sealed', 'opened')),
    reward_product_id UUID REFERENCES public.products(id),  -- set when opened
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    opened_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, cycle_key)           -- one chest per cycle max
);

ALTER TABLE public.user_chests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chests." ON user_chests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chests." ON user_chests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chests." ON user_chests FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 4. PRODUCTS EXTENSION (RARITY)
-- ==========================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'legendary'));

-- Update existing dummy products to have a rarity
UPDATE public.products SET rarity = 'rare' WHERE type = 'avatar_frame';

-- Insert chest rewards catalogue into products
INSERT INTO public.products (name, description, type, price, rarity) VALUES
-- Common (Daily)
('Silver Border', 'Thin silver ring around your avatar', 'avatar_frame', 0, 'common'),
('Pixel Frame', 'Retro 8-bit style border', 'avatar_frame', 0, 'common'),
('Code Rain Banner', 'Matrix-style falling code background', 'theme', 0, 'common'),
('Blue Dot Badge', 'Small blue circle profile badge', 'badge', 0, 'common'),
('Terminal Theme', 'Dark green-on-black color scheme', 'theme', 0, 'common'),
-- Rare (Weekly)
('Neon Holo Frame', 'Animated rainbow holographic border', 'avatar_frame', 0, 'rare'),
('Circuit Board Banner', 'Green circuit trace background', 'theme', 0, 'rare'),
('Silver Streak Badge', 'Awarded for rare chest collection', 'badge', 0, 'rare'),
('Git Graph Theme', 'Graph-inspired dark mode theme', 'theme', 0, 'rare'),
-- Legendary (Monthly)
('Golden Aura Frame', 'Glowing gold animated avatar ring', 'avatar_frame', 0, 'legendary'),
('Cyber City Banner', 'Animated scrolling cyberpunk skyline', 'theme', 0, 'legendary'),
('Crown Badge', 'Gold crown pinned to profile', 'badge', 0, 'legendary'),
('Legendary Dark Theme', 'Deep purple/gold premium color scheme', 'theme', 0, 'legendary')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. QUEST SEED DATA
-- ==========================================

-- Clear existing just in case (optional, safe for active dev)
DELETE FROM public.quests;

INSERT INTO public.quests (key, title, description, type, xp_reward, coins_reward, icon, sort_order) VALUES
-- Daily
('login',        'Daily Login',          'Log in to your account today',      'daily',   10,  5,  'sunrise',    1),
('codele',       'Play Daily Codele',    'Complete today''s Codele puzzle',   'daily',   50, 10,  'terminal',   2),
('lesson',       'Complete a Lesson',    'Finish one lesson in any course',   'daily',   30,  8,  'book-open',  3),
('quiz_attempt', 'Take a DSA Quiz',      'Attempt any DSA quiz',              'daily',   25,  6,  'brain',      4),
('type_race',    'Typing Practice',      'Complete a typing test',            'daily',   15,  4,  'keyboard',   5),

-- Weekly
('codele_3w',    'Codele Streak',        'Complete Codele 3 times this week', 'weekly', 100, 30,  'terminal',   1),
('lessons_5w',   'Study Session',        'Complete 5 lessons this week',      'weekly', 150, 40,  'graduation-cap', 2),
('quiz_3w',      'Quiz Runner',          'Win 3 DSA quizzes this week',       'weekly', 120, 35,  'trophy',     3),
('streak_7',     '7-Day Streak',         'Log in every day this week',        'weekly', 200, 50,  'flame',      4),

-- Monthly
('codele_15m',   'Codele Master',        'Play Codele 15 times this month',   'monthly',500,150, 'terminal',   1),
('streak_20m',   '20-Day Veteran',       'Log in 20 days this month',         'monthly',400,120,  'flame',      2),
('lessons_20m',  'Scholar',              'Complete 20 lessons this month',    'monthly',600,180,  'book-open',  3),
('quiz_10m',     'DSA Guru',             'Win 10 DSA quizzes this month',     'monthly',450,135,  'brain',      4);
