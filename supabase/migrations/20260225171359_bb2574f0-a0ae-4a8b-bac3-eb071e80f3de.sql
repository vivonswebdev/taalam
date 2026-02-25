-- 1) Helper: check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_classroom_member(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classroom_members cm
    WHERE cm.classroom_id = _classroom_id
      AND cm.user_id = _user_id
  );
$$;

-- 2) Helper: check teacher ownership without policy chaining side effects
CREATE OR REPLACE FUNCTION public.is_classroom_teacher(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms c
    WHERE c.id = _classroom_id
      AND c.teacher_id = _user_id
  );
$$;

-- 3) Recreate classrooms SELECT policy (non-recursive)
DROP POLICY IF EXISTS "Teachers and members can view classrooms" ON public.classrooms;
CREATE POLICY "Teachers and members can view classrooms"
ON public.classrooms
FOR SELECT
USING (
  auth.uid() = teacher_id
  OR public.is_classroom_member(id, auth.uid())
);

-- 4) Recreate classroom_members SELECT policy (non-recursive)
DROP POLICY IF EXISTS "Members and teachers can view class members" ON public.classroom_members;
CREATE POLICY "Members and teachers can view class members"
ON public.classroom_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_classroom_teacher(classroom_id, auth.uid())
  OR public.is_classroom_member(classroom_id, auth.uid())
);

-- 5) Prevent duplicate joins
CREATE UNIQUE INDEX IF NOT EXISTS classroom_members_classroom_id_user_id_unique
ON public.classroom_members (classroom_id, user_id);