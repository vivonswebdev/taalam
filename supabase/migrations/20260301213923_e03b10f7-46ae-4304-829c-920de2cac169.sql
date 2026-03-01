
-- Table des défis familiaux
CREATE TABLE public.family_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title text NOT NULL,
  challenge_type text NOT NULL DEFAULT 'quiz', -- quiz, tarteel, hifz, reading
  surah_number integer,
  ayah_from integer,
  ayah_to integer,
  xp_reward integer NOT NULL DEFAULT 50,
  created_by uuid NOT NULL,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.family_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view challenges"
  ON public.family_challenges FOR SELECT
  USING (is_family_member(family_id, auth.uid()));

CREATE POLICY "Parents can create challenges"
  ON public.family_challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_family_parent(family_id, auth.uid()));

CREATE POLICY "Parents can delete challenges"
  ON public.family_challenges FOR DELETE
  USING (is_family_parent(family_id, auth.uid()));

-- Table des scores de défis
CREATE TABLE public.family_challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.family_challenges(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.family_challenge_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view scores"
  ON public.family_challenge_scores FOR SELECT
  USING (is_family_member(family_id, auth.uid()));

CREATE POLICY "Users can insert own scores"
  ON public.family_challenge_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_family_member(family_id, auth.uid()));

CREATE POLICY "Users can update own scores"
  ON public.family_challenge_scores FOR UPDATE
  USING (auth.uid() = user_id);
