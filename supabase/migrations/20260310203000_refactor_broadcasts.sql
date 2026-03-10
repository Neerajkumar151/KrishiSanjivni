-- Refactor admin_messages to support single-row broadcasts
-- 1. Allow receiver_id to be NULL
ALTER TABLE public.admin_messages ALTER COLUMN receiver_id DROP NOT NULL;

-- 2. Update RLS policies to allow reading broadcasts
-- Drop existing select policy
DROP POLICY IF EXISTS "Users can read their own messages" ON public.admin_messages;

-- Create new comprehensive select policy
CREATE POLICY "Users can read their own messages and broadcasts"
ON public.admin_messages
FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    is_broadcast = true
);

-- 3. Cleanup existing duplicate broadcasts (Optional but recommended)
-- This keeps the latest message for each distinct broadcast content if sent by same admin at same time
-- Actually, let's keep it simple and just allow the new system to take over.
-- Clean up: DELETE FROM public.admin_messages WHERE is_broadcast = true;
