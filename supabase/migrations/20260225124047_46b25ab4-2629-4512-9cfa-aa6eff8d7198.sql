
-- Profiles table for auth + leaderboard
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🌙',
  is_public BOOLEAN NOT NULL DEFAULT true,
  country_code TEXT,
  mastery_score NUMERIC NOT NULL DEFAULT 0,
  xp_total INTEGER NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by everyone"
ON public.profiles FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  author_uid UUID NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read announcements"
ON public.announcements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create announcements"
ON public.announcements FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_uid);

-- Announcement reads tracking
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reads"
ON public.announcement_reads FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
ON public.announcement_reads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_user_progress_updated_at();

-- Indexes for leaderboard performance
CREATE INDEX idx_profiles_public_mastery ON public.profiles (is_public, mastery_score DESC) WHERE is_public = true;
CREATE INDEX idx_profiles_country ON public.profiles (country_code, mastery_score DESC) WHERE is_public = true;
CREATE INDEX idx_announcements_class ON public.announcements (class_code, created_at DESC);
