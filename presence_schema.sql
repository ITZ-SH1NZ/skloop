-- Add last_seen column to profiles for offline "last seen" fallback
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Update last_seen whenever a user browses (called from client heartbeat)
-- This is handled client-side via a periodic UPDATE call, no special function needed.
