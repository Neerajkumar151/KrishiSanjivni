-- Fix 1: Restrict profiles table to authenticated users only
-- Previously: USING (true) allowed anyone with anon key to read all profiles
-- Fix: require an active authenticated session

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');
