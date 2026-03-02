
-- Trigger function: notify teacher when a child joins via invitation
CREATE OR REPLACE FUNCTION public.notify_teacher_on_child_joined()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _teacher_id uuid;
  _child_name text;
  _class_name text;
BEGIN
  -- Only fire when status changes to 'child_created'
  IF NEW.status = 'child_created' AND (OLD.status IS DISTINCT FROM 'child_created') THEN
    -- Get teacher id (created_by is the teacher)
    _teacher_id := NEW.created_by;

    -- Get child name
    SELECT name INTO _child_name
    FROM public.children_profiles
    WHERE id = NEW.child_profile_id;

    -- Get class name
    SELECT name INTO _class_name
    FROM public.classrooms
    WHERE id = NEW.classroom_id;

    -- Insert notification for teacher
    INSERT INTO public.notification_log (user_id, type, title, body)
    VALUES (
      _teacher_id,
      'child_joined',
      '👶 Nouvel élève inscrit !',
      COALESCE(_child_name, 'Un enfant') || ' a rejoint la classe ' || COALESCE(_class_name, '')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on class_invitations
CREATE TRIGGER on_child_joined_notify_teacher
AFTER UPDATE ON public.class_invitations
FOR EACH ROW
EXECUTE FUNCTION public.notify_teacher_on_child_joined();
