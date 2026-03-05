-- ================================================
-- MENTORSHIP SYSTEM SCHEMA
-- ================================================
-- Run this in Supabase SQL Editor.
-- Old tables (mentorship_requests, peer_sessions) are left as-is.

-- 1. Add mentor-related columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 2. Mentor extended profile (created when user becomes a mentor)
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  headline TEXT,                        -- e.g. "Senior Engineer @ Google"
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'Flexible',
  is_accepting BOOLEAN DEFAULT TRUE,    -- togglable from dashboard
  hourly_rate INTEGER DEFAULT 0,        -- cost in SKLOOP coins (0 = free)
  path TEXT CHECK (path IN ('veteran', 'vouch')),
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id), -- null = self-approved via level path
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor profiles are public" ON mentor_profiles FOR SELECT USING (true);
CREATE POLICY "Mentors can update own profile" ON mentor_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Mentors can insert own profile" ON mentor_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Vouch codes (one-time use, mentor-generated or admin SQL insert)
CREATE TABLE IF NOT EXISTS mentor_vouch_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  issued_by UUID REFERENCES profiles(id) NOT NULL,
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,               -- null = never expires
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentor_vouch_codes ENABLE ROW LEVEL SECURITY;
-- Mentors can only see codes they issued
CREATE POLICY "Mentors see own codes" ON mentor_vouch_codes FOR SELECT
  USING (auth.uid() = issued_by);
-- Anyone authenticated can check if a code is valid (for redemption)
CREATE POLICY "Authenticated can read codes for redemption" ON mentor_vouch_codes FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Mentors can insert codes" ON mentor_vouch_codes FOR INSERT
  WITH CHECK (auth.uid() = issued_by);
CREATE POLICY "Authenticated can mark code as used" ON mentor_vouch_codes FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 4. Mentor Sessions = public video posts by mentors
--    Mentors post YouTube videos; mentees (or anyone) can view them.
--    Also used for mentee → mentor session requests (if mentor enables it).
CREATE TABLE IF NOT EXISTS mentor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) NOT NULL,
  mentee_id UUID REFERENCES profiles(id),           -- null = public post (no specific mentee)
  title TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  message TEXT,                                      -- mentee's original ask (if request)
  status TEXT DEFAULT 'published'
    CHECK (status IN ('pending', 'accepted', 'declined', 'published')),
  video_url TEXT,                                    -- YouTube URL
  thumbnail_url TEXT,
  premiere_at TIMESTAMPTZ,                           -- optional premiere date
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sessions are viewable by all" ON mentor_sessions
  FOR SELECT USING (is_public = true OR auth.uid() IN (mentor_id, mentee_id));
CREATE POLICY "Mentors can insert their sessions" ON mentor_sessions
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Mentors can update their sessions" ON mentor_sessions
  FOR UPDATE USING (auth.uid() = mentor_id);
-- Mentees can insert session requests
CREATE POLICY "Mentees can request sessions" ON mentor_sessions
  FOR INSERT WITH CHECK (auth.uid() = mentee_id AND is_public = false);

-- 5. Session Reviews (mentee rates a session)
CREATE TABLE IF NOT EXISTS session_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES mentor_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, reviewer_id)
);

ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON session_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can leave reviews" ON session_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
