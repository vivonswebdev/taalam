CREATE TABLE public.tarteel_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah integer NOT NULL,
  ayah integer NOT NULL,
  accuracy decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tarteel_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own tarteel scores" ON public.tarteel_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tarteel scores" ON public.tarteel_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_tarteel_scores_user ON public.tarteel_scores(user_id);
CREATE INDEX idx_tarteel_scores_accuracy ON public.tarteel_scores(accuracy DESC);