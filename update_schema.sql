ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS tags text[];
