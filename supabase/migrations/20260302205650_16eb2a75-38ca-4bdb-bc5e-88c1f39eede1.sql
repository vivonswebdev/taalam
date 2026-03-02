
-- Add mode_password column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mode_password text DEFAULT NULL;

-- Set default password '1234' for existing users who already have a profile
UPDATE public.profiles SET mode_password = '1234' WHERE mode_password IS NULL;
