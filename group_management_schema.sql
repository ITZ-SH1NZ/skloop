-- ==========================================
-- GROUP MANAGEMENT SCHEMA UPDATE
-- ==========================================

-- 1. ADD NEW COLUMNS TO CONVERSATIONS & PARTICIPANTS
-- ==========================================
ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS avatar_url text,
    ADD COLUMN IF NOT EXISTS banner_url text,
    ADD COLUMN IF NOT EXISTS privacy text DEFAULT 'public' CHECK (privacy IN ('public', 'private'));

-- Ensure the 'role' column actually exists (CREATE TABLE IF NOT EXISTS misses new columns)
ALTER TABLE public.conversation_participants
    ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';

-- 2. UPDATE PARTICIPANT ROLES CONSTRAINTS
-- ==========================================
-- Drop existing check constraint if any
ALTER TABLE public.conversation_participants
    DROP CONSTRAINT IF EXISTS conversation_participants_role_check;

-- Add new constraint for roles
ALTER TABLE public.conversation_participants
    ADD CONSTRAINT conversation_participants_role_check 
    CHECK (role IN ('owner', 'admin', 'moderator', 'member'));

-- 3. FUNCTIONS FOR MODERATION & MANAGEMENT
-- ==========================================

-- Function to check role for a conversation
CREATE OR REPLACE FUNCTION public.get_participant_role(convo_id uuid, target_user_id uuid)
RETURNS text AS $$
DECLARE
    role_name text;
BEGIN
    SELECT role INTO role_name
    FROM public.conversation_participants
    WHERE conversation_id = convo_id AND user_id = target_user_id;
    
    RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to update group settings (name, avatar, banner, privacy)
-- Only owner, admin, or moderator can update
CREATE OR REPLACE FUNCTION public.update_group_settings(
    convo_id uuid,
    new_title text DEFAULT NULL,
    new_description text DEFAULT NULL,
    new_avatar_url text DEFAULT NULL,
    new_banner_url text DEFAULT NULL,
    new_privacy text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    caller_role text;
BEGIN
    -- Get caller's role
    caller_role := public.get_participant_role(convo_id, auth.uid());
    
    IF caller_role IN ('owner', 'admin', 'moderator') THEN
        UPDATE public.conversations
        SET 
            title = COALESCE(new_title, title),
            description = COALESCE(new_description, description),
            avatar_url = COALESCE(new_avatar_url, avatar_url),
            banner_url = COALESCE(new_banner_url, banner_url),
            privacy = COALESCE(new_privacy, privacy),
            updated_at = timezone('utc'::text, now())
        WHERE id = convo_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to promote/demote members
CREATE OR REPLACE FUNCTION public.set_participant_role(
    convo_id uuid,
    target_user_id uuid,
    new_role text
)
RETURNS boolean AS $$
DECLARE
    caller_role text;
    target_current_role text;
BEGIN
    -- Get caller's role
    caller_role := public.get_participant_role(convo_id, auth.uid());
    target_current_role := public.get_participant_role(convo_id, target_user_id);
    
    -- Only handle valid roles
    IF new_role NOT IN ('owner', 'admin', 'moderator', 'member') THEN
        RETURN false;
    END IF;
    
    -- Owners can do anything to anyone
    IF caller_role = 'owner' THEN
        -- If passing ownership, demote current owner to admin
        IF new_role = 'owner' THEN
            UPDATE public.conversation_participants
            SET role = 'admin'
            WHERE conversation_id = convo_id AND user_id = auth.uid();
        END IF;

        UPDATE public.conversation_participants
        SET role = new_role
        WHERE conversation_id = convo_id AND user_id = target_user_id;

        RETURN true;
    END IF;

    -- Admins can promote/demote moderators and members, but cannot affect owners or other admins
    IF caller_role = 'admin' THEN
        IF target_current_role IN ('moderator', 'member') AND new_role IN ('admin', 'moderator', 'member') THEN
            UPDATE public.conversation_participants
            SET role = new_role
            WHERE conversation_id = convo_id AND user_id = target_user_id;
            RETURN true;
        END IF;
    END IF;

    -- Moderators/Members cannot change roles
    RETURN false;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS POLICIES FOR SETTINGS UPDATE
-- ==========================================
-- Users can UPDATE conversation settings if they have owner, admin, or moderator role
DROP POLICY IF EXISTS "Admins can update conversation" ON public.conversations;
CREATE POLICY "Admins can update conversation"
    ON public.conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'moderator')
        )
    );
