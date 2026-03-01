-- ==========================================
-- RPC: INCREMENT PROFILE STATS (v2)
-- ==========================================
-- Updates XP/Coins and recalculates Level.
-- Includes safety check to create profile if missing.

CREATE OR REPLACE FUNCTION public.increment_profile_stats(
    x_user_id UUID,
    xp_amount INTEGER,
    coins_amount INTEGER
)
RETURNS JSON AS $$
DECLARE
    current_xp BIGINT;
    new_xp BIGINT;
    new_level INTEGER;
    profile_exists BOOLEAN;
BEGIN
    -- 1. Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = x_user_id) INTO profile_exists;
    
    -- 2. If not exists, attempt to create a basic one (fallback)
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, xp, coins, level, updated_at)
        VALUES (x_user_id, 0, 0, 1, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 3. Fetch current XP
    SELECT xp INTO current_xp FROM public.profiles WHERE id = x_user_id;
    
    -- 4. Calculate new values
    new_xp := COALESCE(current_xp, 0) + xp_amount;
    new_level := FLOOR(new_xp / 500) + 1;
    
    -- 5. Update profile
    UPDATE public.profiles
    SET 
        xp = new_xp,
        coins = COALESCE(coins, 0) + coins_amount,
        level = new_level,
        updated_at = NOW()
    WHERE id = x_user_id;

    RETURN json_build_object(
        'success', true,
        'new_xp', new_xp,
        'new_level', new_level,
        'profile_was_missing', NOT profile_exists
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission so that authenticated users (via Supabase client) can call this RPC.
-- Without this, the RPC returns 403 and XP/Coins are never awarded.
GRANT EXECUTE ON FUNCTION public.increment_profile_stats(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_stats(uuid, integer, integer) TO service_role;
