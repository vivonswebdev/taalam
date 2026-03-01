
-- Create table for sheytan game leaderboard
CREATE TABLE public.sheytan_game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  player_name VARCHAR(16) NOT NULL DEFAULT 'Joueur',
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  verses_collected TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sheytan_game_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view top scores (public leaderboard for kids)
CREATE POLICY "Anyone can view game scores"
ON public.sheytan_game_scores
FOR SELECT
USING (true);

-- Authenticated users can insert their own scores
CREATE POLICY "Authenticated users can insert scores"
ON public.sheytan_game_scores
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

-- Allow anonymous inserts (kids may not be logged in)
CREATE POLICY "Anonymous can insert scores"
ON public.sheytan_game_scores
FOR INSERT
WITH CHECK (user_id IS NULL);
