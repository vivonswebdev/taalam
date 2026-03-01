
-- ASR logging table for dictation audit
CREATE TABLE public.asr_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  mode TEXT NOT NULL DEFAULT 'dictation',
  surah_number INTEGER,
  ayah_number INTEGER,
  expected_text TEXT,
  recognized_text TEXT,
  confidence_score REAL,
  wer_score REAL,
  cer_score REAL,
  is_correct BOOLEAN DEFAULT false,
  duration_ms INTEGER,
  device_info TEXT,
  volume_avg REAL,
  volume_peak REAL,
  voice_profile TEXT DEFAULT 'adult',
  scoring_mode TEXT DEFAULT 'beginner',
  reported_by_user BOOLEAN DEFAULT false,
  report_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asr_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs
CREATE POLICY "Users can insert own asr logs"
ON public.asr_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view own logs
CREATE POLICY "Users can view own asr logs"
ON public.asr_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own logs (for reporting)
CREATE POLICY "Users can update own asr logs"
ON public.asr_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all asr logs"
ON public.asr_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anonymous users can insert logs (no auth required for logging)
CREATE POLICY "Anon can insert asr logs"
ON public.asr_logs FOR INSERT
WITH CHECK (user_id IS NULL);

-- Index for analytics queries
CREATE INDEX idx_asr_logs_created ON public.asr_logs(created_at DESC);
CREATE INDEX idx_asr_logs_user ON public.asr_logs(user_id);
CREATE INDEX idx_asr_logs_mode ON public.asr_logs(mode);
