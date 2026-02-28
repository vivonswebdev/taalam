
-- 1. Input length constraints
ALTER TABLE public.class_messages
ADD CONSTRAINT class_messages_message_length CHECK (length(message) <= 2000 AND length(message) > 0);

ALTER TABLE public.announcements
ADD CONSTRAINT announcements_title_length CHECK (length(title) <= 200 AND length(title) > 0);

ALTER TABLE public.announcements
ADD CONSTRAINT announcements_message_length CHECK (length(message) <= 5000 AND length(message) > 0);

ALTER TABLE public.ayah_notes
ADD CONSTRAINT ayah_notes_content_length CHECK (length(content) <= 10000);

-- 2. Fix family invite code enumeration: drop permissive policy, add secure lookup function
DROP POLICY IF EXISTS "Anyone can lookup family by invite code" ON public.families;

CREATE OR REPLACE FUNCTION public.lookup_family_by_code(_invite_code text)
RETURNS TABLE(id uuid, name text, invite_code text, created_by uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name, f.invite_code, f.created_by
  FROM public.families f
  WHERE f.invite_code = _invite_code
  LIMIT 1;
$$;
