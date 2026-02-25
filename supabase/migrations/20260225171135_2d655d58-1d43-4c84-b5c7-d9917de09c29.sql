-- Fix recursive RLS policies for classroom features
-- 1) Helper function: check membership without triggering RLS recursion
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

-- 2) Classrooms SELECT policy: remove recursive dependency on classroom_members RLS
DROP POLICY IF EXISTS "Teachers and members can view classrooms" ON public.classrooms;

CREATE POLICY "Teachers and members can view classrooms"
ON public.classrooms
FOR SELECT
USING (
  auth.uid() = teacher_id
  OR public.is_classroom_member(id, auth.uid())
);

-- 3) classroom_members SELECT policy: remove self-referencing recursive EXISTS
DROP POLICY IF EXISTS "Members and teachers can view class members" ON public.classroom_members;

CREATE POLICY "Members and teachers can view class members"
ON public.classroom_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.classrooms c
    WHERE c.id = classroom_members.classroom_id
      AND c.teacher_id = auth.uid()
  )
  OR public.is_classroom_member(classroom_id, auth.uid())
);

-- 4) Prevent duplicate joins for same user + classroom
CREATE UNIQUE INDEX IF NOT EXISTS classroom_members_unique_user_per_classroom
ON public.classroom_members (classroom_id, user_id);