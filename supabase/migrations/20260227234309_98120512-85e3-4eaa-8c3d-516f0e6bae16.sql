
-- Table for Hifz plans (user's memorization goals)
CREATE TABLE public.hifz_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mon plan Hifz',
  target_type TEXT NOT NULL DEFAULT 'surahs', -- 'surahs' | 'juz'
  target_items JSONB NOT NULL DEFAULT '[]', -- array of surah numbers or juz numbers
  duration_days INTEGER NOT NULL DEFAULT 90,
  daily_ayat INTEGER NOT NULL DEFAULT 5,
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for daily tasks generated from the plan
CREATE TABLE public.hifz_plan_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.hifz_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  task_date DATE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_from INTEGER NOT NULL,
  ayah_to INTEGER NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'new', -- 'new' | 'review'
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hifz_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_plan_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for hifz_plans
CREATE POLICY "Users can view own plans" ON public.hifz_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plans" ON public.hifz_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.hifz_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.hifz_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for hifz_plan_tasks
CREATE POLICY "Users can view own tasks" ON public.hifz_plan_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.hifz_plan_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.hifz_plan_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.hifz_plan_tasks FOR DELETE USING (auth.uid() = user_id);

-- Index for fast daily lookups
CREATE INDEX idx_hifz_plan_tasks_user_date ON public.hifz_plan_tasks(user_id, task_date);
CREATE INDEX idx_hifz_plans_user_active ON public.hifz_plans(user_id, is_active);
