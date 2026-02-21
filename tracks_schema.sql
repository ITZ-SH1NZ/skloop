-- ==========================================
-- TRACKS & MODULES SYSTEM
-- ==========================================

-- 1. Tracks (High-level learning paths)
create table public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  order_index int default 0,
  created_at timestamp with time zone default now()
);

alter table public.tracks enable row level security;
create policy "Tracks are viewable by everyone." on tracks for select using ( true );

-- 2. Modules (Steps within a track)
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  title text not null,
  description text,
  order_index int not null,
  created_at timestamp with time zone default now()
);

alter table public.modules enable row level security;
create policy "Modules are viewable by everyone." on modules for select using ( true );

-- 3. Topics (Individual lessons/items)
create type public.topic_type as enum ('video', 'quiz', 'article', 'challenge');

create table public.topics (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  type public.topic_type not null,
  order_index int not null,
  position_x int default 50, -- % from left (0-100)
  position_y_index int default 0, -- logic to calculate scroll position
  content_data jsonb default '{}'::jsonb, -- Stores YouTube IDs, Markdown, Challenge metadata
  xp_reward int default 10,
  created_at timestamp with time zone default now()
);

alter table public.topics enable row level security;
create policy "Topics are viewable by everyone." on topics for select using ( true );

-- 4. User Progress
create table public.user_topic_progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade not null,
  status text default 'completed' check (status in ('in_progress', 'completed')),
  completed_at timestamp with time zone default now(),
  primary key (user_id, topic_id)
);

alter table public.user_topic_progress enable row level security;
create policy "Users can view own topic progress." on user_topic_progress for select using ( auth.uid() = user_id );
create policy "Users can update own topic progress." on user_topic_progress for insert with check ( auth.uid() = user_id );

-- ==========================================
-- INITIAL SEED DATA
-- ==========================================

-- Insert Tracks
insert into public.tracks (id, title, slug, description, order_index) values
('f9a62d7c-8b5e-4b1a-9c1a-1a2b3c4d5e6f', 'Web Development', 'web-development', 'Become a full-stack engineer from scratch.', 1),
('a3b8d1b6-0b3b-4b1a-9c1a-1a2b3c4d5e6f', 'Data Structures & Algorithms', 'dsa', 'Master the foundations of computer science.', 2)
on conflict (id) do nothing;

-- Insert Basic Modules for Web Dev
insert into public.modules (id, track_id, title, description, order_index) values
('e1a2f082-d72a-4b28-8100-8b9cad0e1f20', 'f9a62d7c-8b5e-4b1a-9c1a-1a2b3c4d5e6f', 'Module 1: The Building Blocks', 'Introduction to HTML & CSS', 1)
on conflict (id) do nothing;

-- Insert Topics for Module 1
insert into public.topics (module_id, title, type, order_index, content_data, xp_reward) values
('e1a2f082-d72a-4b28-8100-8b9cad0e1f20', 'What is the Web?', 'video', 1, '{"youtubeId": "dQw4w9WgXcQ"}', 10),
('e1a2f082-d72a-4b28-8100-8b9cad0e1f20', 'Basics of HTML', 'article', 2, '{"markdown": "# HTML Basics\nHTML is the standard markup language for documents designed to be displayed in a web browser."}', 15),
('e1a2f082-d72a-4b28-8100-8b9cad0e1f20', 'HTML Challenge', 'challenge', 3, '{"type": "web_ide", "instructions": "Build a basic page with an H1 tag."}', 50)
on conflict do nothing;
