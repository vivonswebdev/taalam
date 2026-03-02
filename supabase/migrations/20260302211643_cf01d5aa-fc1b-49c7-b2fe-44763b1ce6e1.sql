
-- Children profiles table
CREATE TABLE public.children_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  name text NOT NULL,
  avatar_emoji text NOT NULL DEFAULT '👦',
  birth_date date,
  age integer,
  country_code text,
  gender text,
  total_points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_children_parent ON public.children_profiles(parent_id);
CREATE INDEX idx_children_points ON public.children_profiles(total_points DESC);

-- RLS
ALTER TABLE public.children_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children"
  ON public.children_profiles FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert children (max 5)"
  ON public.children_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = parent_id
    AND (SELECT count(*) FROM public.children_profiles WHERE parent_id = auth.uid()) < 5
  );

CREATE POLICY "Parents can update their children"
  ON public.children_profiles FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children"
  ON public.children_profiles FOR DELETE
  USING (auth.uid() = parent_id);

-- Public leaderboard: anyone authenticated can see name, avatar, country, age, points
CREATE POLICY "Authenticated can view leaderboard data"
  ON public.children_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Children points history table
CREATE TABLE public.children_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children_profiles(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL,
  points integer NOT NULL DEFAULT 0,
  activity_type text NOT NULL DEFAULT 'other',
  earned_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_points_child ON public.children_points(child_id);

ALTER TABLE public.children_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children points"
  ON public.children_points FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert points for their children"
  ON public.children_points FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Anyone authenticated can view for leaderboard
CREATE POLICY "Authenticated can view points"
  ON public.children_points FOR SELECT
  TO authenticated
  USING (true);

-- Trigger to update total_points on children_profiles
CREATE OR REPLACE FUNCTION public.update_child_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.children_profiles
  SET total_points = total_points + NEW.points,
      updated_at = now()
  WHERE id = NEW.child_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_child_points
  AFTER INSERT ON public.children_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_child_total_points();
