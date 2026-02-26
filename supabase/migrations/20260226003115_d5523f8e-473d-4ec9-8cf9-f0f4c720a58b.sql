
-- Weekly perfect mode challenges
CREATE TABLE public.perfect_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'mode_parfait_weekly',
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.perfect_challenges ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can see active challenges
CREATE POLICY "Anyone can view challenges"
  ON public.perfect_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Scores per user per challenge
CREATE TABLE public.perfect_challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.perfect_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  best_score integer NOT NULL DEFAULT 0,
  plays integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.perfect_challenge_scores ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see scores (for leaderboard)
CREATE POLICY "Anyone can view scores"
  ON public.perfect_challenge_scores FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores"
  ON public.perfect_challenge_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update own scores"
  ON public.perfect_challenge_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
