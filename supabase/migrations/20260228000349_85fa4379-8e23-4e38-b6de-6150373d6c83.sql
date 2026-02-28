
-- Table: ayah_favorites (per-ayah favorites)
CREATE TABLE public.ayah_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number, ayah_number)
);

ALTER TABLE public.ayah_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.ayah_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.ayah_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.ayah_favorites FOR DELETE USING (auth.uid() = user_id);

-- Table: ayah_notes (personal notes per ayah, optionally shared)
CREATE TABLE public.ayah_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  shared_to_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  shared_to_class_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ayah_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.ayah_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared family notes" ON public.ayah_notes FOR SELECT USING (is_shared = true AND shared_to_family_id IS NOT NULL AND is_family_member(shared_to_family_id, auth.uid()));
CREATE POLICY "Users can view shared class notes" ON public.ayah_notes FOR SELECT USING (is_shared = true AND shared_to_class_id IS NOT NULL AND (is_classroom_member(shared_to_class_id, auth.uid()) OR is_classroom_teacher(shared_to_class_id, auth.uid())));
CREATE POLICY "Users can insert own notes" ON public.ayah_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.ayah_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.ayah_notes FOR DELETE USING (auth.uid() = user_id);
