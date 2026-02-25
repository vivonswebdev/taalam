
-- Classrooms table
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Classroom members table
CREATE TABLE public.classroom_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, user_id)
);

-- Enable RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;

-- Classrooms policies
CREATE POLICY "Anyone authenticated can view classrooms they belong to or teach"
  ON public.classrooms FOR SELECT
  USING (
    auth.uid() = teacher_id
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create classrooms"
  ON public.classrooms FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their classrooms"
  ON public.classrooms FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their classrooms"
  ON public.classrooms FOR DELETE
  USING (auth.uid() = teacher_id);

-- Classroom members policies
CREATE POLICY "Members and teachers can view class members"
  ON public.classroom_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm2
      WHERE cm2.classroom_id = classroom_id AND cm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join classrooms"
  ON public.classroom_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can remove members"
  ON public.classroom_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
    )
  );

-- Allow anyone to look up a classroom by join_code (for joining)
CREATE POLICY "Anyone can look up classrooms by join code"
  ON public.classrooms FOR SELECT
  USING (true);
