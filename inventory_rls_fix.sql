-- ==========================================
-- FIX: USER INVENTORY ROW LEVEL SECURITY
-- ==========================================

-- Allow users to insert their own obtained rewards into the inventory
CREATE POLICY "Users can insert own inventory." 
ON public.user_inventory 
FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- Allow users to update their own inventory (e.g., increasing quantity of an existing item)
CREATE POLICY "Users can update own inventory." 
ON public.user_inventory 
FOR UPDATE 
USING ( auth.uid() = user_id );
