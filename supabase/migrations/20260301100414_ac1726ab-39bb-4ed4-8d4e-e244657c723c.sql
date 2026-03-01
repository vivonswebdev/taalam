
-- Create quran_xp table for centralized XP tracking
CREATE TABLE public.quran_xp (
  user_id UUID NOT NULL PRIMARY KEY,
  xp_total INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reason TEXT
);

-- Enable RLS
ALTER TABLE public.quran_xp ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own xp" ON public.quran_xp
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp" ON public.quran_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own xp" ON public.quran_xp
  FOR UPDATE USING (auth.uid() = user_id);
