
-- 1. Fix announcements: restrict SELECT to class members/teachers only
DROP POLICY "Authenticated can read announcements" ON public.announcements;

CREATE POLICY "Class members can read announcements"
ON public.announcements FOR SELECT
USING (
  -- Author can always read their own
  auth.uid() = author_uid
  OR
  -- Teacher of a class with this join code
  EXISTS (
    SELECT 1 FROM public.classrooms c
    WHERE c.join_code = announcements.class_code
    AND c.teacher_id = auth.uid()
  )
  OR
  -- Member of a class with this join code
  EXISTS (
    SELECT 1 FROM public.classrooms c
    JOIN public.classroom_members cm ON cm.classroom_id = c.id
    WHERE c.join_code = announcements.class_code
    AND cm.user_id = auth.uid()
  )
);

-- 2. Fix classrooms: replace the overly permissive "Anyone authenticated can lookup by join code"
-- Keep it but restrict to only expose rows matching a specific join_code lookup (can't do that in RLS alone)
-- Instead, tighten to: members, teachers, OR authenticated users (for join flow, they need lookup by code)
-- The real issue is it exposes ALL classrooms. We'll restrict to teacher/member + a helper for join lookup.
DROP POLICY "Anyone authenticated can lookup by join code" ON public.classrooms;

-- Teachers and members already have a SELECT policy, so we just need join-code lookup
-- We'll create a security definer function for safe join-code lookup instead
CREATE OR REPLACE FUNCTION public.lookup_classroom_by_code(_join_code text)
RETURNS TABLE(id uuid, name text, join_code text, teacher_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.join_code, c.teacher_id
  FROM public.classrooms c
  WHERE c.join_code = _join_code
  LIMIT 1;
$$;

-- 3. Fix profiles: restrict public exposure
-- Keep "users can read own profile" but tighten public visibility
DROP POLICY "Public profiles viewable by everyone" ON public.profiles;

-- Only authenticated users can see public profiles (not anonymous/unauthenticated)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_public = true);
