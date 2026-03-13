-- Migration: Profile Expansion (Projects Storage & User Timeline)
-- Description: Sets up Supabase Storage for project thumbnails and a dynamic timeline table.

-- 1. Create Storage Bucket for Project Thumbnails
insert into storage.buckets (id, name, public)
values ('project-thumbnails', 'project-thumbnails', true)
on conflict (id) do nothing;

-- 2. Setup Storage Policies for project-thumbnails
-- Allow public access to read thumbnails
create policy "Project Thumbnails Public Access"
on storage.objects for select
using ( bucket_id = 'project-thumbnails' );

-- Allow authenticated users to upload their own thumbnails
create policy "Project Thumbnails Insert Policy"
on storage.objects for insert
with check (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own thumbnails
create policy "Project Thumbnails Update Policy"
on storage.objects for update
using (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own thumbnails
create policy "Project Thumbnails Delete Policy"
on storage.objects for delete
using (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND auth.role() = 'authenticated'
);

-- 3. Create User Timeline Table
create table if not exists public.user_timeline (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    subtitle text,
    description text,
    icon_type text default 'rocket', -- award, code, zap, rocket, book, etc.
    color text default 'text-lime-500', -- text-blue-500, text-amber-500, etc.
    year text, -- E.g. "2026"
    event_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security
alter table public.user_timeline enable row level security;

-- 5. Setup RLS Policies for user_timeline
-- Anyone can view timeline (needed for public profiles)
create policy "Users can view any user's timeline"
    on public.user_timeline for select
    using (true);

-- System or User can insert milestones
create policy "Users can manage their own timeline"
    on public.user_timeline for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 6. Grant Permissions
grant select on public.user_timeline to anon;
grant select, insert, update, delete on public.user_timeline to authenticated;
grant select on public.user_timeline to service_role;

-- 7. Add Index for performance
create index user_timeline_user_id_idx on public.user_timeline(user_id);
create index user_timeline_event_date_idx on public.user_timeline(event_date desc);
