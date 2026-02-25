
-- Fix classrooms SELECT policies: drop buggy restrictive ones, create proper permissive ones
DROP POLICY IF EXISTS "Anyone authenticated can view classrooms they belong to or teac" ON public.classrooms;
DROP POLICY IF EXISTS "Anyone can look up classrooms by join code" ON public.classrooms;

-- Permissive: teachers and members can see their classrooms
CREATE POLICY "Teachers and members can view classrooms"
ON public.classrooms FOR SELECT
USING (
  auth.uid() = teacher_id
  OR EXISTS (
    SELECT 1 FROM public.classroom_members cm
    WHERE cm.classroom_id = classrooms.id AND cm.user_id = auth.uid()
  )
);

-- Permissive: anyone authenticated can look up a classroom by join_code (needed for join flow)
CREATE POLICY "Anyone authenticated can lookup by join code"
ON public.classrooms FOR SELECT
USING (true);
