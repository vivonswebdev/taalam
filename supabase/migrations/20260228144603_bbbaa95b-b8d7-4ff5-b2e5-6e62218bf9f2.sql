
-- Admin settings table (single row for global config)
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hide_announcement boolean NOT NULL DEFAULT false,
  hide_daily_challenge boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for home page)
CREATE POLICY "Anyone can read admin settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed a single default row
INSERT INTO public.admin_settings (hide_announcement, hide_daily_challenge) VALUES (false, false);
