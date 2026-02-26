
-- Families table
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Family members
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_in_family text NOT NULL DEFAULT 'child' CHECK (role_in_family IN ('parent', 'child')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Family notifications (trophies / messages)
CREATE TABLE public.family_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('trophy', 'message')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE public.family_notifications ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is in a family
CREATE OR REPLACE FUNCTION public.is_family_member(_family_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = _user_id
  );
$$;

-- Helper: check if user is parent in a family
CREATE OR REPLACE FUNCTION public.is_family_parent(_family_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = _user_id AND role_in_family = 'parent'
  );
$$;

-- RLS: families
CREATE POLICY "Members can view their families"
  ON public.families FOR SELECT
  USING (is_family_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create families"
  ON public.families FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update family"
  ON public.families FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete family"
  ON public.families FOR DELETE
  USING (auth.uid() = created_by);

-- RLS: family_members
CREATE POLICY "Family members can view members"
  ON public.family_members FOR SELECT
  USING (is_family_member(family_id, auth.uid()));

CREATE POLICY "Parents can add members"
  ON public.family_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR is_family_parent(family_id, auth.uid())
  );

CREATE POLICY "Parents can remove members"
  ON public.family_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_family_parent(family_id, auth.uid())
  );

-- RLS: family_notifications
CREATE POLICY "Recipients can view notifications"
  ON public.family_notifications FOR SELECT
  USING (auth.uid() = to_user_id OR is_family_parent(family_id, auth.uid()));

CREATE POLICY "Family members can send notifications"
  ON public.family_notifications FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id
    AND is_family_member(family_id, auth.uid())
  );

CREATE POLICY "Recipients can mark as read"
  ON public.family_notifications FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Allow anyone authenticated to look up a family by invite code (for joining)
CREATE POLICY "Anyone can lookup family by invite code"
  ON public.families FOR SELECT
  USING (true);
