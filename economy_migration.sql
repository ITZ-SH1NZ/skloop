-- ====================================================================
-- SKLOOP ECONOMY EXPANSION MIGRATION
-- ====================================================================
-- Purpose: Add columns to the existing `profiles` table to track
-- purchased cosmetic items, trading cards, and streak shields.
-- ====================================================================

DO $$
BEGIN

    -- 1. Add `inventory` column as a JSONB array. 
    -- This will hold the IDs of purchased shop items (e.g., cosmetic rings, titles).
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='inventory') THEN
        ALTER TABLE public.profiles ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 2. Add `trading_cards` column as a JSONB array.
    -- Similar to inventory, but specifically designated for the collectible cards 
    -- to separate 'flex' items from 'utilitarian/cosmetic' items in logic.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trading_cards') THEN
        ALTER TABLE public.profiles ADD COLUMN trading_cards JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 3. Add `streak_shields` column as an INTEGER.
    -- Tracks the number of consumable streak protectors the user currently owns.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='streak_shields') THEN
        ALTER TABLE public.profiles ADD COLUMN streak_shields INTEGER DEFAULT 0;
    END IF;

    -- 4. Add `equipped_title` column as a TEXT.
    -- Stores the ID of the currently active title bought from the shop.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='equipped_title') THEN
        ALTER TABLE public.profiles ADD COLUMN equipped_title TEXT;
    END IF;

    -- 5. Add `equipped_ring` column as a TEXT.
    -- Stores the ID of the currently active level-ring cosmetic bought from the shop.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='equipped_ring') THEN
        ALTER TABLE public.profiles ADD COLUMN equipped_ring TEXT;
    END IF;

END $$;
