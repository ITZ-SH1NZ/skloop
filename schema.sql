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
-- 8. MESSAGING & CONNECTIONS
-- ==========================================

create table public.connections (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) not null,
  recipient_id uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(requester_id, recipient_id)
);

alter table public.connections enable row level security;
create policy "Users can view their connections." on connections for select using ( auth.uid() in (requester_id, recipient_id) );
create policy "Users can update their connections." on connections for update using ( auth.uid() in (requester_id, recipient_id) );
create policy "Users can insert connections." on connections for insert with check ( auth.uid() = requester_id );

create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  type text default 'direct' check (type in ('direct', 'group')),
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.conversations enable row level security;
create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);
alter table public.conversation_participants enable row level security;
create policy "Users can view participants in their conversations." on conversation_participants for select using ( 
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid())
);

create policy "Users can view conversations they are part of." on conversations for select using ( 
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid())
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.messages enable row level security;
create policy "Users can view messages in their conversations." on messages for select using ( 
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);
create policy "Users can send messages." on messages for insert with check ( 
  auth.uid() = sender_id and 
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);

-- ==========================================
-- 9. WORKSPACE & PROJECTS
-- ==========================================

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  thumbnail_url text,
  status text default 'active' check (status in ('active', 'archived', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.projects enable row level security;
create policy "Users can create projects." on projects for insert with check ( true );

create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (project_id, user_id)
);
alter table public.project_members enable row level security;
create policy "Users can view project members." on project_members for select using (
  exists (select 1 from public.project_members pm where pm.project_id = project_members.project_id and pm.user_id = auth.uid())
);

create policy "Users can view projects they are a member of." on projects for select using (
  exists (select 1 from public.project_members pm where pm.project_id = id and pm.user_id = auth.uid())
);

create table public.project_tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  assignee_id uuid references public.profiles(id),
  tags text[],
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.project_tasks enable row level security;
create policy "Users can view project tasks." on project_tasks for select using (
  exists (select 1 from public.project_members pm where pm.project_id = project_tasks.project_id and pm.user_id = auth.uid())
);

-- ==========================================
-- 10. MENTORSHIP & PEER SESSIONS
-- ==========================================

create table public.mentorship_requests (
  id uuid default gen_random_uuid() primary key,
  mentor_id uuid references public.profiles(id) not null,
  mentee_id uuid references public.profiles(id) not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.mentorship_requests enable row level security;
create policy "Users can view their mentorship requests." on mentorship_requests for select using ( auth.uid() in (mentor_id, mentee_id) );

create table public.peer_sessions (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) not null,
  user2_id uuid references public.profiles(id),
  topic text,
  start_time timestamp with time zone,
  duration_minutes int default 60,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  meeting_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.peer_sessions enable row level security;
create policy "Session participants can view sessions." on peer_sessions for select using ( auth.uid() in (user1_id, user2_id) );

-- ==========================================
-- 11. MARKETPLACE & INVENTORY
-- ==========================================

create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text check (type in ('avatar_frame', 'badge', 'theme', 'boost')),
  price int not null default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on products for select using ( true );

create table public.user_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  quantity int default 1,
  acquired_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id)
);
alter table public.user_inventory enable row level security;
create policy "Users can view own inventory." on user_inventory for select using ( auth.uid() = user_id );

-- ==========================================
-- 12. PRACTICE & LESSONS
-- ==========================================

create table public.dsa_quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  question_content text not null,
  correct_answer text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.dsa_quizzes enable row level security;
create policy "Quizzes are viewable by everyone." on dsa_quizzes for select using ( true );

create table public.user_quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  quiz_id uuid references public.dsa_quizzes(id) not null,
  score int,
  passed boolean,
  attempted_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.user_quiz_attempts enable row level security;
create policy "Users can view own quiz attempts." on user_quiz_attempts for select using ( auth.uid() = user_id );

create table public.typing_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  wpm int not null,
  accuracy numeric(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.typing_scores enable row level security;
create policy "Everyone can view typing scores (for leaderboards)." on typing_scores for select using ( true );
create policy "Users can insert own typing scores." on typing_scores for insert with check ( auth.uid() = user_id );

create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  content text,
  video_url text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.lessons enable row level security;
create policy "Lessons are viewable by everyone." on lessons for select using ( true );

create table public.user_lesson_progress (
  user_id uuid references public.profiles(id) not null,
  lesson_id uuid references public.lessons(id) not null,
  status text default 'completed' check (status in ('in_progress', 'completed')),
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, lesson_id)
);
alter table public.user_lesson_progress enable row level security;
create policy "Users can view own lesson progress." on user_lesson_progress for select using ( auth.uid() = user_id );

-- ==========================================
-- 13. CALENDAR EVENTS
-- ==========================================

create table public.user_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  event_type text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.user_events enable row level security;
create policy "Users can manage own calendar events." on user_events for all using ( auth.uid() = user_id );

-- ==========================================
-- 14. ROADMAPS
-- ==========================================

create table public.roadmaps (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.roadmaps enable row level security;
create policy "Roadmaps are viewable by everyone." on roadmaps for select using ( true );

create table public.roadmap_milestones (
  id uuid default gen_random_uuid() primary key,
  roadmap_id uuid references public.roadmaps(id) on delete cascade not null,
  title text not null,
  description text,
  order_index int default 0
);
alter table public.roadmap_milestones enable row level security;
create policy "Roadmap milestones are viewable by everyone." on roadmap_milestones for select using ( true );

create table public.user_roadmaps (
  user_id uuid references public.profiles(id) not null,
  roadmap_id uuid references public.roadmaps(id) not null,
  current_milestone_id uuid references public.roadmap_milestones(id),
  started_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, roadmap_id)
);
alter table public.user_roadmaps enable row level security;
create policy "Users can view own roadmap progress." on user_roadmaps for select using ( auth.uid() = user_id );

-- ==========================================
-- 15. STORAGE BUCKETS (App Assets)
-- ==========================================

insert into storage.buckets (id, name, public) 
values 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true),
  ('project_images', 'project_images', true),
  ('product_images', 'product_images', true),
  ('message_attachments', 'message_attachments', true)
on conflict (id) do nothing;

create policy "Avatars are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');
create policy "Banners are publicly accessible." on storage.objects for select using (bucket_id = 'banners');
create policy "Project Images are publicly accessible." on storage.objects for select using (bucket_id = 'project_images');
create policy "Product Images are publicly accessible." on storage.objects for select using (bucket_id = 'product_images');
create policy "Message Attachments are publicly accessible." on storage.objects for select using (bucket_id = 'message_attachments');

create policy "Users can upload their own avatars." on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update their own avatars." on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can upload their own banners." on storage.objects for insert with check (bucket_id = 'banners' and auth.role() = 'authenticated');
create policy "Users can update their own banners." on storage.objects for update using (bucket_id = 'banners' and auth.role() = 'authenticated');

create policy "Users can upload project images." on storage.objects for insert with check (bucket_id = 'project_images' and auth.role() = 'authenticated');
create policy "Users can update project images." on storage.objects for update using (bucket_id = 'project_images' and auth.role() = 'authenticated');

create policy "Users can upload message attachments." on storage.objects for insert with check (bucket_id = 'message_attachments' and auth.role() = 'authenticated');
create policy "Users can update message attachments." on storage.objects for update using (bucket_id = 'message_attachments' and auth.role() = 'authenticated');

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

-- Projects (Workspace)
insert into public.projects (name, description, status) values
('Skloop UI Redesign', 'Overhaul of the main dashboard UI', 'active');

-- Products (Marketplace)
insert into public.products (name, description, type, price) values
('Gold Frame', 'A shiny golden frame for your avatar.', 'avatar_frame', 500);
