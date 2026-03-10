-- Create admin_messages table
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_broadcast BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read messages where they are sender or receiver
CREATE POLICY "Users can read their own messages"
ON public.admin_messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can only insert messages where sender_id is themselves
CREATE POLICY "Users can insert their own messages"
ON public.admin_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Optional: Allow users to update is_read status for messages sent to them
CREATE POLICY "Users can update their received messages"
ON public.admin_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Create an index for faster queries on sender and receiver
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON public.admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_receiver ON public.admin_messages(receiver_id);
