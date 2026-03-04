-- ==========================================
-- STUDY CIRCLES SCHEMA (RLS POLICIES)
-- ==========================================
-- Run this AFTER corrected_chat_schema.sql

-- 1. Allow any authenticated user to VIEW ALL group conversations (Study Circles)
-- (They need to see the directory of circles before joining)
DROP POLICY IF EXISTS "Users can view all public study circles" ON public.conversations;
CREATE POLICY "Users can view all public study circles" 
ON public.conversations 
FOR SELECT 
USING ( type = 'group' AND auth.role() = 'authenticated' );

-- 2. Allow any authenticated user to CREATE a new group conversation
DROP POLICY IF EXISTS "Users can create study circles" ON public.conversations;
CREATE POLICY "Users can create study circles" 
ON public.conversations 
FOR INSERT 
WITH CHECK ( type = 'group' AND auth.role() = 'authenticated' );

-- 3. Allow any authenticated user to JOIN a group conversation 
-- (They can only insert themselves, and only into groups)
DROP POLICY IF EXISTS "Users can join study circles" ON public.conversation_participants;
CREATE POLICY "Users can join study circles" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK ( 
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id AND type = 'group'
    )
);

-- 4. Allow users to LEAVE study circles
DROP POLICY IF EXISTS "Users can leave study circles" ON public.conversation_participants;
CREATE POLICY "Users can leave study circles" 
ON public.conversation_participants 
FOR DELETE 
USING ( 
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id AND type = 'group'
    )
);
