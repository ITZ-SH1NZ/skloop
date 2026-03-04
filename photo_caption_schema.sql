-- Add caption column to messages for image+caption combo messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS caption TEXT;

-- Update existing messages: no changes needed, caption defaults to NULL
-- This allows image messages to have an optional caption stored alongside the image URL
