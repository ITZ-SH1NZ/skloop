-- Migration: Create user_projects table
-- Description: Stores project portfolio items for users to display on their profiles

-- 0. Create updated_at handled function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. Create the table
create table public.user_projects (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text not null,
    thumbnail_url text, -- Can store image URLs or supabase storage paths later
    github_url text,
    website_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
alter table public.user_projects enable row level security;

-- 3. Setup RLS Policies
-- Anyone can view projects (needed for public profiles)
create policy "Users can view any user's projects"
    on public.user_projects for select
    using (true);

-- Users can insert their own projects
create policy "Users can create their own projects"
    on public.user_projects for insert
    with check (auth.uid() = user_id);

-- Users can update their own projects
create policy "Users can update their own projects"
    on public.user_projects for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Users can delete their own projects
create policy "Users can delete their own projects"
    on public.user_projects for delete
    using (auth.uid() = user_id);

-- 4. Create trigger for updated_at
create trigger set_user_projects_updated_at
    before update on public.user_projects
    for each row
    execute function public.handle_updated_at();

-- 5. Add some indexes for performance
create index user_projects_user_id_idx on public.user_projects(user_id);
create index user_projects_created_at_idx on public.user_projects(created_at desc);

-- 6. Grant sequence/table permissions to authenticated and anon
grant select on public.user_projects to anon;
grant select, insert, update, delete on public.user_projects to authenticated;
grant select on public.user_projects to service_role;
