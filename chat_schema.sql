-- ==========================================
-- REAL-TIME CHAT SYSTEM SCHEMA
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

-- Function to check if a user is a participant
CREATE OR REPLACE FUNCTION public.is_participant(convo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = convo_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Conversations
DROP POLICY IF EXISTS "Users can view conversations they are part of." ON public.conversations;
CREATE POLICY "Users can view conversations they are part of."
    ON public.conversations FOR SELECT
    USING (public.is_participant(id));

DROP POLICY IF EXISTS "Users can insert direct conversations." ON public.conversations;
CREATE POLICY "Users can insert direct conversations."
    ON public.conversations FOR INSERT
    WITH CHECK (type = 'direct' OR type = 'group');

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
    WITH CHECK (user_id = auth.uid() OR public.is_participant(conversation_id));

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

-- Enable Realtime for Messages
-- alter publication supabase_realtime add table public.messages;
