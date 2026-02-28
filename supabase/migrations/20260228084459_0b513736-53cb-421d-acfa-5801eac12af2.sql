
-- Table for teacher assignments/homework
CREATE TABLE public.class_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'other',
  target jsonb NOT NULL DEFAULT '{}'::jsonb,
  due_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can CRUD their own class assignments
CREATE POLICY "Teachers can view class assignments"
  ON public.class_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = class_assignments.class_id
        AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their class assignments"
  ON public.class_assignments FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = class_assignments.class_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create assignments"
  ON public.class_assignments FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = class_assignments.class_id
        AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update assignments"
  ON public.class_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = class_assignments.class_id
        AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete assignments"
  ON public.class_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = class_assignments.class_id
        AND c.teacher_id = auth.uid()
    )
  );
