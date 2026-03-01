
-- Individual tasks assigned by teacher to specific students
CREATE TABLE public.student_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  title text NOT NULL,
  task_type text NOT NULL DEFAULT 'hifz', -- 'hifz', 'revision', 'recitation', 'other'
  surah_number integer,
  ayah_from integer,
  ayah_to integer,
  description text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

-- Teachers can view tasks in their classes
CREATE POLICY "Teachers can view class tasks"
ON public.student_tasks FOR SELECT
TO authenticated
USING (is_classroom_teacher(class_id, auth.uid()));

-- Students can view their own tasks
CREATE POLICY "Students can view own tasks"
ON public.student_tasks FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Teachers can create tasks
CREATE POLICY "Teachers can create tasks"
ON public.student_tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = assigned_by
  AND is_classroom_teacher(class_id, auth.uid())
);

-- Teachers can update tasks
CREATE POLICY "Teachers can update tasks"
ON public.student_tasks FOR UPDATE
TO authenticated
USING (is_classroom_teacher(class_id, auth.uid()));

-- Students can update their own tasks (mark complete)
CREATE POLICY "Students can update own tasks"
ON public.student_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Teachers can delete tasks
CREATE POLICY "Teachers can delete tasks"
ON public.student_tasks FOR DELETE
TO authenticated
USING (is_classroom_teacher(class_id, auth.uid()));
