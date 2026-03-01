
-- Add age_group column to profiles table
ALTER TABLE public.profiles ADD COLUMN age_group text NOT NULL DEFAULT 'adult';
