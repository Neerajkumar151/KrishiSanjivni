-- Fix 2: Ensure chat messages always belong to a conversation
-- Previously: conversation_id was nullable, allowing orphaned messages. Test TC006 found this.

ALTER TABLE public.chat_messages
ALTER COLUMN conversation_id SET NOT NULL;
