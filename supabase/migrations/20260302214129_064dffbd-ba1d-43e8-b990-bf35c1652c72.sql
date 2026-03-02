
-- Create class_invitations table
CREATE TABLE public.class_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  invite_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  parent_email text,
  parent_user_id uuid,
  child_profile_id uuid REFERENCES public.children_profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(invite_code)
);

-- Enable RLS
ALTER TABLE public.class_invitations ENABLE ROW LEVEL SECURITY;

-- Teachers can create invitations for their classes
CREATE POLICY "Teachers can create invitations"
ON public.class_invitations
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND is_classroom_teacher(classroom_id, auth.uid())
);

-- Teachers can view invitations for their classes
CREATE POLICY "Teachers can view class invitations"
ON public.class_invitations
FOR SELECT
USING (is_classroom_teacher(classroom_id, auth.uid()));

-- Teachers can update invitations for their classes
CREATE POLICY "Teachers can update class invitations"
ON public.class_invitations
FOR UPDATE
USING (is_classroom_teacher(classroom_id, auth.uid()));

-- Teachers can delete invitations for their classes
CREATE POLICY "Teachers can delete class invitations"
ON public.class_invitations
FOR DELETE
USING (is_classroom_teacher(classroom_id, auth.uid()));

-- Parents can view invitations addressed to them (by code lookup or user_id)
CREATE POLICY "Parents can view own invitations"
ON public.class_invitations
FOR SELECT
USING (auth.uid() = parent_user_id);

-- Parents can update their own invitations (accept)
CREATE POLICY "Parents can accept invitations"
ON public.class_invitations
FOR UPDATE
USING (auth.uid() = parent_user_id);

-- Coordinators can view all invitations
CREATE POLICY "Coordinators can view all invitations"
ON public.class_invitations
FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Function to lookup invitation by code (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.lookup_invitation_by_code(_invite_code text)
RETURNS TABLE(
  id uuid,
  classroom_id uuid,
  invite_code text,
  parent_email text,
  parent_user_id uuid,
  child_profile_id uuid,
  status text,
  created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.classroom_id, i.invite_code, i.parent_email, i.parent_user_id, i.child_profile_id, i.status, i.created_by
  FROM public.class_invitations i
  WHERE i.invite_code = _invite_code
  AND i.status = 'pending'
  LIMIT 1;
$$;
