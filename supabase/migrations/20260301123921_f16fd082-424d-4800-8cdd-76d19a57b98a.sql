
-- Hifz SRS items: tracks each memorized passage with spaced repetition metadata
CREATE TABLE public.hifz_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  ayah_from integer NOT NULL,
  ayah_to integer NOT NULL,
  -- SM-2 algorithm fields
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 1,
  repetitions integer NOT NULL DEFAULT 0,
  next_review_date date NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at timestamp with time zone,
  last_quality integer,  -- 0-5 SM-2 quality grade
  -- metadata
  status text NOT NULL DEFAULT 'learning',  -- learning, reviewing, mastered
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number, ayah_from, ayah_to)
);

-- Enable RLS
ALTER TABLE public.hifz_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own hifz items"
ON public.hifz_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hifz items"
ON public.hifz_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hifz items"
ON public.hifz_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hifz items"
ON public.hifz_items FOR DELETE
USING (auth.uid() = user_id);

-- Index for daily reviews query
CREATE INDEX idx_hifz_items_review ON public.hifz_items (user_id, next_review_date);
