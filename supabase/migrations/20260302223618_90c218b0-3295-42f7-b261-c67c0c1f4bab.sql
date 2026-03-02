
-- Table for math game scores (leaderboard)
CREATE TABLE public.math_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children_profiles(id) ON DELETE CASCADE,
  game_type text NOT NULL DEFAULT 'quick_calc', -- quick_calc, calc_merge, number_runner, math_shooter
  score integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  max_combo integer NOT NULL DEFAULT 0,
  operations text NOT NULL DEFAULT '+', -- ops used: +, -, x, /
  xp_earned integer NOT NULL DEFAULT 0,
  played_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.math_scores ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view for leaderboard
CREATE POLICY "Authenticated can view math scores"
ON public.math_scores FOR SELECT
TO authenticated
USING (true);

-- Parents can insert scores for their children
CREATE POLICY "Parents can insert math scores"
ON public.math_scores FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children_profiles
    WHERE id = math_scores.child_id AND parent_id = auth.uid()
  )
);

-- Parents can delete their children's scores
CREATE POLICY "Parents can delete math scores"
ON public.math_scores FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children_profiles
    WHERE id = math_scores.child_id AND parent_id = auth.uid()
  )
);

-- Index for leaderboard queries
CREATE INDEX idx_math_scores_game_score ON public.math_scores(game_type, score DESC);
CREATE INDEX idx_math_scores_child ON public.math_scores(child_id);
