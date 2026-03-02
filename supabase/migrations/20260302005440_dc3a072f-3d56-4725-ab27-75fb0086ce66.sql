
-- Create good_deeds_progress table for cloud sync
CREATE TABLE public.good_deeds_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deed_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_deeds text[] NOT NULL DEFAULT '{}',
  boost_active boolean NOT NULL DEFAULT false,
  boost_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, deed_date)
);

-- Enable RLS
ALTER TABLE public.good_deeds_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own deeds"
ON public.good_deeds_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deeds"
ON public.good_deeds_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deeds"
ON public.good_deeds_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deeds"
ON public.good_deeds_progress FOR DELETE
USING (auth.uid() = user_id);

-- Parents can view children's deeds
CREATE POLICY "Parents can view children deeds"
ON public.good_deeds_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid()
    AND fm1.role_in_family = 'parent'
    AND fm2.user_id = good_deeds_progress.user_id
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_good_deeds_progress_updated_at
BEFORE UPDATE ON public.good_deeds_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_progress_updated_at();
