ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS login_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date date,
ADD COLUMN IF NOT EXISTS xp_weekly integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_login_streak ON public.profiles(login_streak DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_date);