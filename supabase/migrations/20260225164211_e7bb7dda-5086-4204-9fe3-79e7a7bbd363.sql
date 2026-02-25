
-- Weekly Hifz challenges per class
CREATE TABLE public.class_weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_from INTEGER NOT NULL,
  ayah_to INTEGER NOT NULL,
  double_xp BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, week_start)
);

ALTER TABLE public.class_weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Teachers can create challenges for their classes
CREATE POLICY "Teachers can create challenges"
ON public.class_weekly_challenges FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = class_id AND c.teacher_id = auth.uid())
);

-- Members and teachers can view challenges
CREATE POLICY "Class participants can view challenges"
ON public.class_weekly_challenges FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = class_id AND c.teacher_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.classroom_members cm WHERE cm.classroom_id = class_id AND cm.user_id = auth.uid())
);

-- Teachers can update their challenges
CREATE POLICY "Teachers can update challenges"
ON public.class_weekly_challenges FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = class_id AND c.teacher_id = auth.uid())
);

-- Teachers can delete their challenges
CREATE POLICY "Teachers can delete challenges"
ON public.class_weekly_challenges FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = class_id AND c.teacher_id = auth.uid())
);

-- Challenge results
CREATE TABLE public.class_challenge_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.class_weekly_challenges(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.class_challenge_results ENABLE ROW LEVEL SECURITY;

-- Users can insert their own results
CREATE POLICY "Users can insert own results"
ON public.class_challenge_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Class participants can view results
CREATE POLICY "Class participants can view results"
ON public.class_challenge_results FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = class_id AND c.teacher_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.classroom_members cm WHERE cm.classroom_id = class_id AND cm.user_id = auth.uid())
);
