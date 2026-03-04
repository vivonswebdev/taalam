
-- Fix: Convert restrictive leaderboard policies to permissive on children_profiles
DROP POLICY IF EXISTS "Authenticated can view leaderboard data" ON public.children_profiles;
DROP POLICY IF EXISTS "Parents can view their children" ON public.children_profiles;

CREATE POLICY "Authenticated can view leaderboard data"
  ON public.children_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Parents can view their children"
  ON public.children_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);
