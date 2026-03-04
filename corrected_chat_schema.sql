-- ==========================================
-- CORRECTED CHAT SCHEMA (Stabilized)
-- ==========================================

-- 1. TABLES
-- ==========================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    title text,
    description text,
    tags text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT now()
);

-- Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    role text DEFAULT 'member', -- owner, admin, member
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) NOT NULL,
    content text,
    type text DEFAULT 'text', -- text, image, sticker, gif
    attachment_url text, -- legacy column
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. SECURITY FUNCTIONS (Non-Recursive)
-- ==========================================

-- Helper function to check if the current user is a participant of a conversation.
-- Using SECURITY DEFINER to bypass RLS recursion on the table itself.
CREATE OR REPLACE FUNCTION public.check_chat_access(convo_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.conversation_participants
        WHERE conversation_id = convo_id 
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC for Atomic Direct Chat Creation (Prevents race conditions and partial creation)
CREATE OR REPLACE FUNCTION public.initiate_direct_chat(target_user_id uuid)
RETURNS uuid AS $$
DECLARE
    new_convo_id uuid;
    caller_id uuid := auth.uid();
BEGIN
    -- 1. Check if a direct conversation already exists between these two
    SELECT cp1.conversation_id INTO new_convo_id
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    JOIN public.conversations c ON c.id = cp1.conversation_id
    WHERE c.type = 'direct'
      AND cp1.user_id = caller_id
      AND cp2.user_id = target_user_id
    LIMIT 1;

    -- 2. If it exists, return it
    IF new_convo_id IS NOT NULL THEN
        RETURN new_convo_id;
    END IF;

    -- 3. If not, create a new conversation
    INSERT INTO public.conversations (type)
    VALUES ('direct')
    RETURNING id INTO new_convo_id;

    -- 4. Add both participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (new_convo_id, caller_id), (new_convo_id, target_user_id);

    RETURN new_convo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RLS POLICIES
-- ==========================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT 
USING ( public.check_chat_access(id) );

-- Participants Policies
DROP POLICY IF EXISTS "Users can view participants" ON public.conversation_participants;
CREATE POLICY "Users can view participants" 
ON public.conversation_participants FOR SELECT 
USING ( public.check_chat_access(conversation_id) );

-- Messages Policies
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
CREATE POLICY "Users can view messages" 
ON public.messages FOR SELECT 
USING ( public.check_chat_access(conversation_id) );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK ( 
    auth.uid() = sender_id 
    AND public.check_chat_access(conversation_id) 
);

-- 4. STORAGE
-- ==========================================

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_attachments', 'message_attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'message_attachments');

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'message_attachments' 
    AND auth.role() = 'authenticated'
);
