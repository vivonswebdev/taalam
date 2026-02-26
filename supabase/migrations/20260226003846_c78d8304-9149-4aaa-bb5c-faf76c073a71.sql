
-- Question stats for SRS / adaptive revision
CREATE TABLE public.question_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id text NOT NULL,
  seen integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.question_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.question_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.question_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.question_stats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_question_stats_user ON public.question_stats(user_id);
