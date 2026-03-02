
-- Create child_achievements table
CREATE TABLE public.child_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children_profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  name text NOT NULL,
  description text,
  icon text DEFAULT '🏆',
  rarity text NOT NULL DEFAULT 'common',
  points_required integer DEFAULT 0,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.child_achievements ENABLE ROW LEVEL SECURITY;

-- Parents can view their children's achievements
CREATE POLICY "Parents can view children achievements"
ON public.child_achievements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.children_profiles
    WHERE id = child_achievements.child_id
    AND parent_id = auth.uid()
  )
);

-- Parents can insert achievements for their children
CREATE POLICY "Parents can insert children achievements"
ON public.child_achievements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children_profiles
    WHERE id = child_achievements.child_id
    AND parent_id = auth.uid()
  )
);

-- Parents can delete children achievements
CREATE POLICY "Parents can delete children achievements"
ON public.child_achievements
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.children_profiles
    WHERE id = child_achievements.child_id
    AND parent_id = auth.uid()
  )
);

-- Authenticated users can view achievements for leaderboard
CREATE POLICY "Authenticated can view achievements for leaderboard"
ON public.child_achievements
FOR SELECT
USING (true);
