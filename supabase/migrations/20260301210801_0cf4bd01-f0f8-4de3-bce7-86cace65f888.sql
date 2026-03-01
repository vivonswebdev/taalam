
-- Table for student task submissions (audio, text, etc.)
CREATE TABLE public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.class_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  audio_url TEXT,
  score_tajwid REAL,
  teacher_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Students can insert own submissions
CREATE POLICY "Students can submit own work"
ON public.task_submissions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND is_classroom_member(class_id, auth.uid())
);

-- Students can view own submissions
CREATE POLICY "Students can view own submissions"
ON public.task_submissions FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Teachers can view submissions for their classes
CREATE POLICY "Teachers can view class submissions"
ON public.task_submissions FOR SELECT
TO authenticated
USING (is_classroom_teacher(class_id, auth.uid()));

-- Teachers can update submissions (approve/reject)
CREATE POLICY "Teachers can review submissions"
ON public.task_submissions FOR UPDATE
TO authenticated
USING (is_classroom_teacher(class_id, auth.uid()));

-- Coordinators can view all
CREATE POLICY "Coordinators can view all submissions"
ON public.task_submissions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Parents can view their children's submissions via family
CREATE POLICY "Parents can view family submissions"
ON public.task_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid()
    AND fm1.role_in_family = 'parent'
    AND fm2.user_id = task_submissions.student_id
  )
);

-- Students can delete own pending submissions
CREATE POLICY "Students can delete own pending submissions"
ON public.task_submissions FOR DELETE
TO authenticated
USING (auth.uid() = student_id AND status = 'pending');

-- Index for fast lookups
CREATE INDEX idx_task_submissions_assignment ON public.task_submissions(assignment_id);
CREATE INDEX idx_task_submissions_student ON public.task_submissions(student_id);
CREATE INDEX idx_task_submissions_class ON public.task_submissions(class_id);

-- Storage bucket for student audio recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('student-audio', 'student-audio', false);

-- Students can upload their own audio
CREATE POLICY "Students upload own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Students can view own audio
CREATE POLICY "Students view own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Teachers can view student audio in their classes
CREATE POLICY "Teachers view class student audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-audio'
  AND EXISTS (
    SELECT 1 FROM classroom_members cm
    JOIN classrooms c ON c.id = cm.classroom_id
    WHERE c.teacher_id = auth.uid()
    AND cm.user_id::text = (storage.foldername(name))[1]
  )
);

-- Students can delete own audio
CREATE POLICY "Students delete own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
