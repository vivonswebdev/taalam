-- Add new columns to listening_sessions for advanced listening mode
ALTER TABLE public.listening_sessions 
  ADD COLUMN IF NOT EXISTS from_ayah integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS to_ayah integer,
  ADD COLUMN IF NOT EXISTS duration_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_quiz boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_score integer;