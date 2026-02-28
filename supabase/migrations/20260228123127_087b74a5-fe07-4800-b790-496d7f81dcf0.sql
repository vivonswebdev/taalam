-- Create helper function to check if user is a teacher for a class_code
CREATE OR REPLACE FUNCTION public.is_class_teacher(_class_code text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE join_code = _class_code
    AND teacher_id = _user_id
  );
$$;

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Authenticated can create announcements" ON public.announcements;

-- Create restrictive policy: only teachers can create announcements for their classes
CREATE POLICY "Teachers can create announcements"
ON public.announcements FOR INSERT
WITH CHECK (
  auth.uid() = author_uid
  AND is_class_teacher(class_code, auth.uid())
);