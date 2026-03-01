
-- Create table for Coran Crush highscores
CREATE TABLE public.crush_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Joueur',
  avatar_emoji TEXT NOT NULL DEFAULT '🌙',
  level INTEGER NOT NULL DEFAULT 1,
  high_score INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  total_cleared INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.crush_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view scores (leaderboard)
CREATE POLICY "Anyone can view crush scores"
ON public.crush_scores FOR SELECT USING (true);

-- Users can insert own scores
CREATE POLICY "Users can insert own crush scores"
ON public.crush_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own scores
CREATE POLICY "Users can update own crush scores"
ON public.crush_scores FOR UPDATE USING (auth.uid() = user_id);
