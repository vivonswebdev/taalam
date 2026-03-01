
-- Coordinators (moderators) can view all classrooms
CREATE POLICY "Coordinators can view all classrooms"
ON public.classrooms
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can view all classroom members
CREATE POLICY "Coordinators can view all classroom members"
ON public.classroom_members
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can view all class assignments
CREATE POLICY "Coordinators can view all class assignments"
ON public.class_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can view all profiles (for student info)
CREATE POLICY "Coordinators can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can view all user progress
CREATE POLICY "Coordinators can view all user progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can view all announcements
CREATE POLICY "Coordinators can view all announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Coordinators can create announcements for any class
CREATE POLICY "Coordinators can create announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_uid AND public.has_role(auth.uid(), 'moderator'));
