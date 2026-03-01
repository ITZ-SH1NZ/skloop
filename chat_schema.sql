-- ==========================================
-- REAL-TIME CHAT SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Conversations (Supports both DMs and Group 'Study Circles')
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    title TEXT, -- Nullable, mainly for groups
    description TEXT,
    tags TEXT[], -- To store the associated track for Study Circles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Conversation Participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Function to check if a user is a participant (SECURITY DEFINER for RLS performance)
CREATE OR REPLACE FUNCTION public.is_participant(convo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = convo_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper RPC: Find an existing direct conversation between two users
CREATE OR REPLACE FUNCTION public.get_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    convo_id UUID;
BEGIN
    SELECT cp1.conversation_id INTO convo_id
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2
        ON cp1.conversation_id = cp2.conversation_id
    JOIN public.conversations c
        ON c.id = cp1.conversation_id
    WHERE cp1.user_id = user1_id
      AND cp2.user_id = user2_id
      AND c.type = 'direct'
    LIMIT 1;

    RETURN convo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_direct_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_participant(UUID) TO authenticated;

-- Policies for Conversations
DROP POLICY IF EXISTS "Users can view conversations they are part of." ON public.conversations;
CREATE POLICY "Users can view conversations they are part of."
    ON public.conversations FOR SELECT
    USING (public.is_participant(id));

DROP POLICY IF EXISTS "Users can insert direct conversations." ON public.conversations;
CREATE POLICY "Users can insert direct conversations."
    ON public.conversations FOR INSERT
    WITH CHECK (true); -- Checked at participant level; authenticated users can create convos

DROP POLICY IF EXISTS "Users can update conversations they are part of." ON public.conversations;
CREATE POLICY "Users can update conversations they are part of."
    ON public.conversations FOR UPDATE
    USING (public.is_participant(id));

-- Policies for Participants
DROP POLICY IF EXISTS "Users can view participants of their conversations." ON public.conversation_participants;
CREATE POLICY "Users can view participants of their conversations."
    ON public.conversation_participants FOR SELECT
    USING (public.is_participant(conversation_id));

DROP POLICY IF EXISTS "Users can insert themselves into a conversation." ON public.conversation_participants;
CREATE POLICY "Users can insert themselves into a conversation."
    ON public.conversation_participants FOR INSERT
    WITH CHECK (true); -- Handled server-side via service role or SECURITY DEFINER functions

DROP POLICY IF EXISTS "Users can update their own participant record (last_read_at)." ON public.conversation_participants;
CREATE POLICY "Users can update their own participant record (last_read_at)."
    ON public.conversation_participants FOR UPDATE
    USING (user_id = auth.uid());


-- 3. Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'gif', 'system')),
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for Messages
DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
CREATE POLICY "Users can view messages in their conversations."
    ON public.messages FOR SELECT
    USING (public.is_participant(conversation_id));

DROP POLICY IF EXISTS "Users can insert messages in their conversations." ON public.messages;
CREATE POLICY "Users can insert messages in their conversations."
    ON public.messages FOR INSERT
    WITH CHECK (
        public.is_participant(conversation_id) AND
        sender_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their own messages." ON public.messages;
CREATE POLICY "Users can update their own messages."
    ON public.messages FOR UPDATE
    USING (sender_id = auth.uid());

-- Trigger to update `conversations.updated_at` when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- ==========================================
-- CRITICAL: Enable Realtime for Messages
-- This must be run for real-time to work!
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
