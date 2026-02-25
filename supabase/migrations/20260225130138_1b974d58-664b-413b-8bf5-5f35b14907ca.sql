
-- Function to sync xp_total from user_progress to profiles
CREATE OR REPLACE FUNCTION public.sync_xp_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET xp_total = NEW.xp_total,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger on INSERT
CREATE TRIGGER sync_xp_on_insert
AFTER INSERT ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.sync_xp_to_profile();

-- Trigger on UPDATE
CREATE TRIGGER sync_xp_on_update
AFTER UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.sync_xp_to_profile();

-- Backfill existing data
UPDATE public.profiles p
SET xp_total = up.xp_total
FROM public.user_progress up
WHERE p.user_id = up.user_id;
