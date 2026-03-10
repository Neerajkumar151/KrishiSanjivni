-- Add DELETE policy for chat_conversations
CREATE POLICY "Users can delete their own conversations or public sessions"
  ON public.chat_conversations FOR DELETE
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Add DELETE policy for chat_messages
CREATE POLICY "Users can delete messages from their conversations"
  ON public.chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );
