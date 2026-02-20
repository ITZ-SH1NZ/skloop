-- ==========================================
-- DANGER ZONE: DROP ALL CUSTOM TABLES & FUNCTIONS
-- ==========================================
-- Run this block first to completely clear your public schema
-- Warnings: This will delete ALL your existing data!

-- 1. Drop the Auth trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;

-- 2. Drop all tables in dependency order (children first, then parents)
drop table if exists public.user_roadmaps cascade;
drop table if exists public.roadmap_milestones cascade;
drop table if exists public.roadmaps cascade;

drop table if exists public.user_events cascade;

drop table if exists public.user_lesson_progress cascade;
drop table if exists public.lessons cascade;

drop table if exists public.user_quiz_attempts cascade;
drop table if exists public.dsa_quizzes cascade;
drop table if exists public.typing_scores cascade;

drop table if exists public.user_inventory cascade;
drop table if exists public.products cascade;

drop table if exists public.peer_sessions cascade;
drop table if exists public.mentorship_requests cascade;

drop table if exists public.project_tasks cascade;
drop table if exists public.project_members cascade;
drop table if exists public.projects cascade;

drop table if exists public.messages cascade;
drop table if exists public.conversation_participants cascade;
drop table if exists public.conversations cascade;
drop table if exists public.connections cascade;

drop table if exists public.workshops cascade;

drop table if exists public.user_puzzle_attempts cascade;
drop table if exists public.daily_puzzles cascade;

drop table if exists public.user_courses cascade;
drop table if exists public.courses cascade;

drop table if exists public.notifications cascade;

drop table if exists public.user_tasks cascade;
drop table if exists public.tasks cascade;

drop table if exists public.activity_logs cascade;

drop table if exists public.profiles cascade;

-- Note: We do NOT drop auth.users as that is managed by Supabase Authentication. 
-- We also do not drop storage.buckets because the `on conflict do nothing` in the main script handles them gracefully. 
