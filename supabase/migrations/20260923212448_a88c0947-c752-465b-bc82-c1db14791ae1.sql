
-- ===== Helper: community membership (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_community_member(_community_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_members WHERE community_id = _community_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_community_member_count(_community_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.community_members WHERE community_id = _community_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_community_member_count(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view community members" ON public.community_members;
CREATE POLICY "Members can view fellow members" ON public.community_members
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_community_member(community_id, auth.uid()));

-- ===== admin_settings: expose only flags via RPC
DROP POLICY IF EXISTS "Anyone can read admin settings" ON public.admin_settings;
CREATE POLICY "Admins can read settings" ON public.admin_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.get_public_admin_settings()
RETURNS TABLE(id uuid, hide_announcement boolean, hide_daily_challenge boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, hide_announcement, hide_daily_challenge FROM public.admin_settings LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_admin_settings() TO anon, authenticated;

-- ===== Children data: owner-only, leaderboard via restricted RPC
DROP POLICY IF EXISTS "Authenticated can view leaderboard data" ON public.children_profiles;
DROP POLICY IF EXISTS "Authenticated can view achievements for leaderboard" ON public.child_achievements;
DROP POLICY IF EXISTS "Authenticated can view points" ON public.children_points;
DROP POLICY IF EXISTS "Authenticated can view math scores" ON public.math_scores;
CREATE POLICY "Parents can view their children math scores" ON public.math_scores
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.children_profiles cp WHERE cp.id = math_scores.child_id AND cp.parent_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.get_kids_leaderboard(_limit integer DEFAULT 200)
RETURNS TABLE(id uuid, name text, avatar_emoji text, country_code text, age integer, total_points integer, is_own boolean, badges jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cp.id, cp.name, cp.avatar_emoji, cp.country_code, cp.age, cp.total_points,
         (cp.parent_id = auth.uid()) AS is_own,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('icon', a.icon, 'rarity', a.rarity))
                   FROM public.child_achievements a WHERE a.child_id = cp.id), '[]'::jsonb) AS badges
  FROM public.children_profiles cp
  WHERE auth.uid() IS NOT NULL
  ORDER BY cp.total_points DESC
  LIMIT LEAST(GREATEST(_limit, 1), 200);
$$;
REVOKE EXECUTE ON FUNCTION public.get_kids_leaderboard(integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_kids_leaderboard(integer) TO authenticated;

-- ===== crush_scores: own row + leaderboard RPC
DROP POLICY IF EXISTS "Anyone can view crush scores" ON public.crush_scores;
CREATE POLICY "Users can view own crush scores" ON public.crush_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.get_crush_leaderboard(_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, user_id uuid, display_name text, avatar_emoji text, level integer, high_score integer, max_combo integer, total_cleared integer, updated_at timestamptz, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, user_id, display_name, avatar_emoji, level, high_score, max_combo, total_cleared, updated_at, created_at
  FROM public.crush_scores ORDER BY high_score DESC LIMIT LEAST(GREATEST(_limit, 1), 100);
$$;
GRANT EXECUTE ON FUNCTION public.get_crush_leaderboard(integer) TO anon, authenticated;

-- ===== sheytan: signed-in only inserts
DROP POLICY IF EXISTS "Anonymous can insert scores" ON public.sheytan_game_scores;
DROP POLICY IF EXISTS "Authenticated users can insert scores" ON public.sheytan_game_scores;
CREATE POLICY "Signed-in users insert own scores" ON public.sheytan_game_scores
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ===== Server-side bounds on self-reported values
CREATE OR REPLACE FUNCTION public.validate_game_values()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'children_points' THEN
    IF NEW.points < 0 OR NEW.points > 500 THEN RAISE EXCEPTION 'points out of range'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.children_profiles WHERE id = NEW.child_id AND parent_id = NEW.parent_id) THEN
      RAISE EXCEPTION 'child does not belong to parent';
    END IF;
    IF (SELECT COALESCE(sum(points),0) FROM public.children_points WHERE child_id = NEW.child_id AND earned_at > now() - interval '1 day') + NEW.points > 5000 THEN
      RAISE EXCEPTION 'daily points limit reached';
    END IF;
  ELSIF TG_TABLE_NAME = 'math_scores' THEN
    IF NEW.score < 0 OR NEW.score > 100000 OR NEW.xp_earned < 0 OR NEW.xp_earned > 500
       OR NEW.level < 0 OR NEW.level > 100 OR NEW.max_combo < 0 OR NEW.max_combo > 1000 THEN
      RAISE EXCEPTION 'math score out of range';
    END IF;
  ELSIF TG_TABLE_NAME = 'crush_scores' THEN
    IF NEW.high_score < 0 OR NEW.high_score > 1000000 OR NEW.level < 0 OR NEW.level > 500 THEN
      RAISE EXCEPTION 'crush score out of range';
    END IF;
    IF NEW.user_id <> auth.uid() THEN RAISE EXCEPTION 'not allowed'; END IF;
    SELECT COALESCE(p.display_name, NEW.display_name), COALESCE(p.avatar_emoji, NEW.avatar_emoji)
      INTO NEW.display_name, NEW.avatar_emoji FROM public.profiles p WHERE p.user_id = NEW.user_id;
    NEW.display_name := left(COALESCE(NEW.display_name, 'Joueur'), 40);
  ELSIF TG_TABLE_NAME = 'perfect_challenge_scores' THEN
    IF NEW.best_score < 0 OR NEW.best_score > 1000 THEN RAISE EXCEPTION 'score out of range'; END IF;
    IF TG_OP = 'UPDATE' THEN
      IF NEW.plays > OLD.plays + 1 OR NEW.plays < OLD.plays THEN RAISE EXCEPTION 'invalid plays'; END IF;
      NEW.challenge_id := OLD.challenge_id; NEW.user_id := OLD.user_id;
    ELSE
      NEW.plays := 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.perfect_challenges c WHERE c.id = NEW.challenge_id AND now() BETWEEN c.start_at AND c.end_at) THEN
      RAISE EXCEPTION 'challenge not active';
    END IF;
  ELSIF TG_TABLE_NAME = 'family_challenge_scores' THEN
    IF NEW.score < 0 OR NEW.score > 1000 THEN RAISE EXCEPTION 'score out of range'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.family_challenges c WHERE c.id = NEW.challenge_id AND c.family_id = NEW.family_id AND now() BETWEEN c.starts_at AND c.ends_at + interval '1 day') THEN
      RAISE EXCEPTION 'challenge not active';
    END IF;
  ELSIF TG_TABLE_NAME = 'tarteel_scores' THEN
    IF NEW.accuracy < 0 OR NEW.accuracy > 100 OR NEW.surah < 1 OR NEW.surah > 114 OR NEW.ayah < 1 OR NEW.ayah > 286 THEN
      RAISE EXCEPTION 'tarteel score out of range';
    END IF;
  ELSIF TG_TABLE_NAME = 'sheytan_game_scores' THEN
    IF NEW.score < 0 OR NEW.score > 1000000 OR NEW.level < 0 OR NEW.level > 100 THEN
      RAISE EXCEPTION 'game score out of range';
    END IF;
    NEW.player_name := left(NEW.player_name, 16);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_children_points BEFORE INSERT ON public.children_points FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_math_scores BEFORE INSERT ON public.math_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_crush_scores BEFORE INSERT OR UPDATE ON public.crush_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_perfect_scores BEFORE INSERT OR UPDATE ON public.perfect_challenge_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_family_scores BEFORE INSERT OR UPDATE ON public.family_challenge_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_tarteel_scores BEFORE INSERT ON public.tarteel_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();
CREATE TRIGGER trg_validate_sheytan_scores BEFORE INSERT ON public.sheytan_game_scores FOR EACH ROW EXECUTE FUNCTION public.validate_game_values();

-- XP: clamp growth per write
CREATE OR REPLACE FUNCTION public.clamp_xp_growth()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.xp_total := LEAST(GREATEST(NEW.xp_total, 0), 5000);
  ELSE
    NEW.xp_total := LEAST(GREATEST(NEW.xp_total, 0), OLD.xp_total + 500);
  END IF;
  IF TG_TABLE_NAME = 'user_progress' THEN
    NEW.xp_today := LEAST(GREATEST(NEW.xp_today, 0), 2000);
    IF TG_OP = 'UPDATE' THEN
      NEW.streak_days := LEAST(GREATEST(NEW.streak_days, 0), OLD.streak_days + 1);
    ELSE
      NEW.streak_days := LEAST(GREATEST(NEW.streak_days, 0), 1);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_clamp_user_progress BEFORE INSERT OR UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.clamp_xp_growth();
CREATE TRIGGER trg_clamp_quran_xp BEFORE INSERT OR UPDATE ON public.quran_xp FOR EACH ROW EXECUTE FUNCTION public.clamp_xp_growth();

-- ===== Longer family invite codes (new families)
ALTER TABLE public.families ALTER COLUMN invite_code SET DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

-- ===== Cron secret for check-notifications
CREATE TABLE IF NOT EXISTS public.internal_secrets (name text PRIMARY KEY, value text NOT NULL);
GRANT ALL ON public.internal_secrets TO service_role;
ALTER TABLE public.internal_secrets ENABLE ROW LEVEL SECURITY;
INSERT INTO public.internal_secrets(name, value)
VALUES ('cron_secret', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;

-- ===== email-assets: only admins may upload
DROP POLICY IF EXISTS "Authenticated users can upload email assets" ON storage.objects;
CREATE POLICY "Admins can upload email assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin') AND owner_id = (select auth.uid()::text));
