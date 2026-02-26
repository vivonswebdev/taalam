
-- Listening sessions: tracks each surah listened
CREATE TABLE public.listening_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  start_at timestamp with time zone NOT NULL DEFAULT now(),
  end_at timestamp with time zone,
  listened_full boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'reader',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.listening_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.listening_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.listening_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.listening_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_listening_sessions_user ON public.listening_sessions(user_id, surah_number);

-- Weak surahs: per-user weakness scores
CREATE TABLE public.weak_surahs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  weakness_score real NOT NULL DEFAULT 0.5,
  last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number)
);

ALTER TABLE public.weak_surahs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weak surahs"
  ON public.weak_surahs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weak surahs"
  ON public.weak_surahs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weak surahs"
  ON public.weak_surahs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_weak_surahs_user ON public.weak_surahs(user_id, weakness_score DESC);
