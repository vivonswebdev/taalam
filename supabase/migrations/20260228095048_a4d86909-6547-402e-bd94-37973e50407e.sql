
-- Table for FCM tokens
CREATE TABLE public.fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  device_info text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens" ON public.fcm_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Table for notification preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hifz_reminder boolean NOT NULL DEFAULT true,
  assignment_reminder boolean NOT NULL DEFAULT true,
  nudge_enabled boolean NOT NULL DEFAULT true,
  reminder_hour integer NOT NULL DEFAULT 8,
  reminder_minute integer NOT NULL DEFAULT 0,
  nudge_after_days integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification log for analytics
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sent_at timestamptz NOT NULL DEFAULT now(),
  opened_at timestamptz
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notification_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notification_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notification_log FOR UPDATE USING (auth.uid() = user_id);
