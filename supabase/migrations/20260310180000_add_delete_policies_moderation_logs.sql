-- Create a policy to allow admins to delete moderation logs
CREATE POLICY "Admins can delete moderation logs"
ON "public"."moderation_logs"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
