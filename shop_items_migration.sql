-- Create shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category TEXT NOT NULL, -- title, consumable, cosmetic, card
    rarity TEXT NOT NULL, -- common, rare, epic, legendary
    icon_name TEXT, -- Lucide icon component name
    image_url TEXT,
    gradient TEXT,
    accent_color TEXT,
    visual_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON public.shop_items
    FOR SELECT USING (true);

-- Seed initial items and 30+ new ones
INSERT INTO public.shop_items (id, name, description, price, category, rarity, icon_name, gradient, accent_color, visual_data) VALUES
-- Existing items (translated)
('item_streak_shield', 'Streak Shield', 'Protects your daily streak automatically if you miss a day.', 50, 'consumable', 'rare', 'Shield', 'from-blue-600 via-indigo-700 to-blue-900', '#6366f1', '{"colorClass": "text-blue-400", "badgeColorClass": "bg-blue-500"}'),
('title_pixel_pusher', 'Pixel Pusher', 'For those who obsessed over 1px paddings.', 150, 'title', 'rare', 'Zap', 'from-rose-500 via-pink-600 to-rose-900', '#f43f5e', '{}'),
('title_algo_lord', 'Algo Lord', 'O(1) in the streets, legendary in the loop.', 500, 'title', 'legendary', 'Crown', 'from-amber-400 via-yellow-600 to-amber-900', '#f59e0b', '{}'),
('ring_obsidian', 'Obsidian Ring', 'A sleek dark ring for your avatar level indicator.', 300, 'cosmetic', 'epic', 'Circle', 'from-zinc-700 via-zinc-800 to-black', '#a1a1aa', '{"colorClass": "text-zinc-800", "secondaryColorClass": "text-zinc-400", "badgeColorClass": "bg-zinc-800", "badgeTextColorClass": "text-white"}'),
('ring_neon', 'Neon Loop', 'A vibrant cyan ring for your avatar.', 250, 'cosmetic', 'epic', 'Circle', 'from-cyan-500 via-sky-600 to-blue-800', '#06b6d4', '{"colorClass": "text-cyan-400", "secondaryColorClass": "text-cyan-100", "badgeColorClass": "bg-cyan-500"}'),

-- 30+ New Items
('title_null_pointer', 'Null Pointer', 'You''ve been there. We all have.', 100, 'title', 'common', 'Bug', 'from-zinc-400 to-zinc-600', '#a1a1aa', '{}'),
('title_git_master', 'Git Master', 'Conflict resolution is your second language.', 200, 'title', 'rare', 'GitBranch', 'from-orange-500 to-red-600', '#f97316', '{}'),
('title_stack_hero', 'Stack Hero', 'Saved more devs than a hospital.', 250, 'title', 'rare', 'Layers', 'from-orange-400 to-orange-700', '#fb923c', '{}'),
('title_css_wizard', 'CSS Wizard', 'z-index: 9999999 is your middle name.', 400, 'title', 'epic', 'Palette', 'from-blue-400 via-indigo-500 to-purple-600', '#818cf8', '{}'),
('title_kernel_hacker', 'Kernel Hacker', 'You speak to the silicon directly.', 1000, 'title', 'legendary', 'Cpu', 'from-zinc-900 via-zinc-800 to-green-950', '#22c55e', '{"badgeTextColorClass": "text-green-400"}'),
('title_vim_god', 'Vim God', ':wq is how you say goodbye.', 1200, 'title', 'legendary', 'Terminal', 'from-green-600 to-green-900', '#16a34a', '{}'),
('title_junior_dev', 'Junior Dev', 'Still optimistic about the deadline.', 50, 'title', 'common', 'Baby', 'from-emerald-300 to-emerald-500', '#6ee7b7', '{}'),
('title_lead_arch', 'Lead Architect', 'Box and arrow diagrams are your life.', 600, 'title', 'epic', 'Share2', 'from-slate-700 to-slate-900', '#64748b', '{}'),
('title_indie_maker', 'Indie Maker', 'Shipping products while others sleep.', 300, 'title', 'rare', 'Rocket', 'from-sky-400 to-blue-600', '#38bdf8', '{}'),
('title_bug_hunter', 'Bug Hunter', 'You find them, you squash them.', 250, 'title', 'rare', 'Search', 'from-red-400 to-red-700', '#f87171', '{}'),
('title_the_compiler', 'The Compiler', 'You take the source and make it truth.', 700, 'title', 'epic', 'Zap', 'from-yellow-400 to-yellow-700', '#fbbf24', '{}'),
('title_o1_guru', 'O(1) Guru', 'Computational complexity is a myth to you.', 1500, 'title', 'legendary', 'Trophy', 'from-amber-400 via-yellow-500 to-amber-600', '#fbbf24', '{}'),

('item_xp_booster', 'XP Booster (2x)', 'Doubles XP for the next hour.', 200, 'consumable', 'rare', 'ArrowUpCircle', 'from-emerald-500 to-emerald-700', '#10b981', '{}'),
('item_coin_magnet', 'Coin Magnet', 'Small chance to get double coins for 24h.', 400, 'consumable', 'epic', 'Magnet', 'from-yellow-400 to-orange-500', '#fbbf24', '{}'),
('item_shield_plus', 'Challenge Shield', 'Lose no XP on a failed challenge.', 150, 'consumable', 'rare', 'ShieldAlert', 'from-blue-400 to-blue-700', '#60a5fa', '{}'),
('item_daily_skip', 'Daily Skip', 'Auto-completes one daily quest.', 500, 'consumable', 'epic', 'CheckCircle2', 'from-purple-500 to-indigo-600', '#8b5cf6', '{}'),

('ring_ruby_spark', 'Ruby Spark', 'A brilliant red ring of passion.', 400, 'cosmetic', 'rare', 'Circle', 'from-red-500 to-rose-700', '#f43f5e', '{"colorClass": "text-red-500", "secondaryColorClass": "text-rose-200", "badgeColorClass": "bg-red-600"}'),
('ring_emerald_glow', 'Emerald Glow', 'The vibrant green of a successful build.', 400, 'cosmetic', 'rare', 'Circle', 'from-emerald-400 to-green-700', '#10b981', '{"colorClass": "text-emerald-500", "secondaryColorClass": "text-emerald-100", "badgeColorClass": "bg-emerald-600"}'),
('ring_sapphire_pulse', 'Sapphire Pulse', 'A deep blue pulsing with energy.', 600, 'cosmetic', 'epic', 'Circle', 'from-blue-500 to-indigo-800', '#3b82f6', '{"colorClass": "text-blue-500", "secondaryColorClass": "text-sky-200", "badgeColorClass": "bg-blue-600"}'),
('ring_void_loop', 'Void Loop', 'Fixes the black-on-black issue with a purple core.', 1200, 'cosmetic', 'legendary', 'Circle', 'from-zinc-900 via-purple-950 to-black', '#a855f7', '{"colorClass": "text-purple-600", "secondaryColorClass": "text-zinc-400", "badgeColorClass": "bg-zinc-900", "badgeTextColorClass": "text-purple-400"}'),
('ring_cyber_cyan', 'Cyber Cyan', 'The future is neon.', 800, 'cosmetic', 'epic', 'Circle', 'from-cyan-400 to-blue-600', '#22d3ee', '{"colorClass": "text-cyan-400", "secondaryColorClass": "text-blue-200", "badgeColorClass": "bg-cyan-600"}'),
('ring_golden_ratio', 'Golden Ratio', 'Perfectly balanced as all code should be.', 1500, 'cosmetic', 'legendary', 'Circle', 'from-amber-400 via-yellow-600 to-amber-900', '#f59e0b', '{"colorClass": "text-amber-500", "secondaryColorClass": "text-yellow-100", "badgeColorClass": "bg-amber-600"}'),

('card_first_commit', 'The First Commit', 'Where it all began.', 100, 'card', 'common', 'GitCommit', 'from-zinc-300 to-zinc-500', '#d4d4d8', '{}'),
('card_legacy_code', 'Legacy Code', 'Don''t touch it. It works.', 300, 'card', 'rare', 'History', 'from-sepia-400 to-stone-600', '#78716c', '{}'),
('card_prod_error', 'Production Error', 'The ultimate adrenaline rush.', 500, 'card', 'epic', 'AlertTriangle', 'from-red-600 to-red-950', '#ef4444', '{}'),
('card_monolith', 'The Monolith', 'She''s big, she''s heavy, she''s one.', 400, 'card', 'rare', 'Box', 'from-slate-500 to-slate-800', '#475569', '{}'),
('card_microservice', 'Microservice', 'One of many. Hard to track.', 600, 'card', 'epic', 'Boxes', 'from-indigo-400 to-blue-600', '#818cf8', '{}'),
('card_pull_request', 'Pull Request', 'Awaiting approval...', 150, 'card', 'common', 'GitPullRequest', 'from-emerald-400 to-emerald-600', '#34d399', '{}'),
('card_singleton', 'The Singleton', 'There can only be one.', 350, 'card', 'rare', 'Target', 'from-violet-400 to-indigo-600', '#8b5cf6', '{}'),
('card_binary_split', 'Binary Search', 'Divide and conquer.', 700, 'card', 'epic', 'Split', 'from-cyan-400 to-blue-700', '#22d3ee', '{}')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    icon_name = EXCLUDED.icon_name,
    gradient = EXCLUDED.gradient,
    accent_color = EXCLUDED.accent_color,
    visual_data = EXCLUDED.visual_data;
