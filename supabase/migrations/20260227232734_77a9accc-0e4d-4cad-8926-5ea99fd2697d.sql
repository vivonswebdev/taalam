
-- Daily Qur'an activity tracking
CREATE TABLE public.quran_daily_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_quran INTEGER NOT NULL DEFAULT 0,
  ayat_recited INTEGER NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE public.quran_daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
ON public.quran_daily_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
ON public.quran_daily_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
ON public.quran_daily_activity FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_quran_daily_activity_updated_at
BEFORE UPDATE ON public.quran_daily_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_user_progress_updated_at();
