-- ==========================================
-- 1. PROFILES & AUTH EXTENSION
-- ==========================================

-- Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  banner_url text,
  role text default 'Learner',
  bio text,
  location text,
  website text,
  xp bigint default 0,
  coins bigint default 0,
  level int default 1,
  streak int default 0,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create Profile on Signup (Trigger)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- ==========================================
-- 2. ACTIVITY & STATS
-- ==========================================

create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  activity_date date default current_date,
  hours_spent numeric(4,2) default 0,
  focus_area text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.activity_logs enable row level security;
create policy "Users can view own activity." on activity_logs for select using ( auth.uid() = user_id );

-- ==========================================
-- 3. TASKS & QUESTS
-- ==========================================

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text check (type in ('code', 'concept', 'social', 'practice')),
  xp_reward int default 10,
  coin_reward int default 5,
  meta text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.tasks enable row level security;
create policy "Tasks are viewable by everyone." on tasks for select using ( true );

-- User Progress on Tasks
create table public.user_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  task_id uuid references public.tasks(id) not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamp with time zone,
  unique(user_id, task_id)
);

alter table public.user_tasks enable row level security;
create policy "Users can view own task progress." on user_tasks for select using ( auth.uid() = user_id );
create policy "Users can update own task progress." on user_tasks for insert with check ( auth.uid() = user_id );
create policy "Users can update own task progress update." on user_tasks for update using ( auth.uid() = user_id );

-- ==========================================
-- 4. NOTIFICATIONS
-- ==========================================

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text,
  type text default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications." on notifications for select using ( auth.uid() = user_id );
create policy "Users can update own notifications." on notifications for update using ( auth.uid() = user_id );

-- ==========================================
-- 5. COURSES (for Hero Card)
-- ==========================================

create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  total_lessons int default 0,
  image_url text
);

alter table public.courses enable row level security;
create policy "Courses are viewable by everyone." on courses for select using ( true );

-- User Course Progress
create table public.user_courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  course_id uuid references public.courses(id) not null,
  completed_lessons int default 0,
  last_accessed timestamp with time zone default now(),
  is_pinned boolean default false, -- For "Current Focus"
  unique(user_id, course_id)
);

alter table public.user_courses enable row level security;
create policy "Users can view own course progress." on user_courses for select using ( auth.uid() = user_id );

-- ==========================================
-- 6. DAILY GAME (Codele)
-- ==========================================

create table public.daily_puzzles (
  id uuid default gen_random_uuid() primary key,
  puzzle_date date unique not null,
  word text not null, -- The secret word
  created_at timestamp with time zone default now()
);

-- Only backend/admin should really see the word, but for simplicity:
alter table public.daily_puzzles enable row level security;
create policy "Public can view daily puzzles (masking could be handled in API)." on daily_puzzles for select using ( true );

create table public.user_puzzle_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  puzzle_id uuid references public.daily_puzzles(id) not null,
  attempts int default 0,
  status text default 'playing' check (status in ('playing', 'won', 'lost')),
  last_guess text,
  unique(user_id, puzzle_id)
);

alter table public.user_puzzle_attempts enable row level security;
create policy "Users can view own puzzle attempts." on user_puzzle_attempts for select using ( auth.uid() = user_id );
create policy "Users can insert own puzzle attempts." on user_puzzle_attempts for insert with check ( auth.uid() = user_id );
create policy "Users can update own puzzle attempts." on user_puzzle_attempts for update using ( auth.uid() = user_id );

-- ==========================================
-- 7. EVENTS & WORKSHOPS
-- ==========================================

create table public.workshops (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  image_url text,
  tags text[]
);

alter table public.workshops enable row level security;
create policy "Workshops are viewable by everyone." on workshops for select using ( true );

-- ==========================================
-- DUMMY DATA SEEDING
-- ==========================================

-- Tasks
insert into public.tasks (title, description, type, xp_reward, coin_reward, meta) values
('Daily Algorithm Challenge', 'Solve the Fibonacci sequence using global memoization.', 'code', 50, 20, '15 min'),
('React Context API', 'Read the documentation on React Context and write a summary.', 'concept', 30, 10, '20 min'),
('Community Help', 'Reply to a help request in the #react-help channel.', 'social', 20, 5, '5 min');

-- Courses
insert into public.courses (title, slug, description, total_lessons) values 
('React Design Patterns', 'react-patterns', 'Master advanced patterns like Composition and HOCs.', 12),
('System Design Interface', 'system-design', 'Learn to build scalable UIs.', 8);

-- Puzzles
insert into public.daily_puzzles (puzzle_date, word) values 
(current_date, 'REACT'),
(current_date + interval '1 day', 'HOOKS');

-- Workshops
insert into public.workshops (title, description, start_time, tags) values
('System Design Interviews', 'Load Balancing and Sharding deep dive.', now() + interval '1 day', ARRAY['Design', 'Backend']);
