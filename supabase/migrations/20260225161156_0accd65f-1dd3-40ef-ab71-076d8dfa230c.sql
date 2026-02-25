
-- Create class_messages table for group chat
CREATE TABLE public.class_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;

-- Members and teachers can read messages in their classes
CREATE POLICY "Class members can read messages"
ON public.class_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_members cm
    WHERE cm.classroom_id = class_messages.classroom_id AND cm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.classrooms c
    WHERE c.id = class_messages.classroom_id AND c.teacher_id = auth.uid()
  )
);

-- Members and teachers can insert messages
CREATE POLICY "Class members can send messages"
ON public.class_messages FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND (
    EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = class_messages.classroom_id AND cm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = class_messages.classroom_id AND c.teacher_id = auth.uid()
    )
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_messages;
