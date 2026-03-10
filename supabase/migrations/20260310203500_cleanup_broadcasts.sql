-- Clean up legacy duplicate broadcast messages
-- This removes broadcast messages that were sent to individual users
-- (The new system uses NULL receiver_id for all broadcasts)
DELETE FROM public.admin_messages 
WHERE is_broadcast = true 
AND receiver_id IS NOT NULL;
