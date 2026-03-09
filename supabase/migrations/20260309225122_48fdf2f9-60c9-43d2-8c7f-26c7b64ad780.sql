-- Create the missing trigger to sync XP from quran_xp to profiles
CREATE TRIGGER sync_xp_on_quran_xp_change
AFTER INSERT OR UPDATE ON public.quran_xp
FOR EACH ROW
EXECUTE FUNCTION public.sync_xp_to_profile();

-- Sync all existing quran_xp data to profiles (fix current desync)
UPDATE public.profiles p
SET xp_total = q.xp_total, updated_at = now()
FROM public.quran_xp q
WHERE p.user_id = q.user_id AND p.xp_total != q.xp_total;

-- Enable realtime on profiles table for leaderboard instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;