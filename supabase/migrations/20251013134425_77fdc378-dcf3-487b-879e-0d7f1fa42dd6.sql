-- Create chat conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
CREATE POLICY "Users can view their own conversations or public sessions"
  ON public.chat_conversations FOR SELECT
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for chat_messages
CREATE POLICY "Users can view messages from their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

CREATE POLICY "Anyone can create messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);