
-- Table for teacher-parent messages (chat, one-off reports, auto notifications)
CREATE TABLE public.teacher_parent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  student_id uuid, -- the student this message concerns (optional)
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'chat', -- 'chat', 'report', 'auto'
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_parent_messages ENABLE ROW LEVEL SECURITY;

-- Teachers can read messages in their classes
CREATE POLICY "Teachers can view class messages"
ON public.teacher_parent_messages FOR SELECT
TO authenticated
USING (
  is_classroom_teacher(class_id, auth.uid())
);

-- Parents/members can view messages sent to or from them
CREATE POLICY "Users can view own messages"
ON public.teacher_parent_messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Teachers can send messages to class members
CREATE POLICY "Teachers can send messages"
ON public.teacher_parent_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND is_classroom_teacher(class_id, auth.uid())
);

-- Parents/members can send messages to teacher
CREATE POLICY "Members can send messages to teacher"
ON public.teacher_parent_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND is_classroom_member(class_id, auth.uid())
);

-- Users can mark messages as read
CREATE POLICY "Receiver can mark as read"
ON public.teacher_parent_messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_parent_messages;
