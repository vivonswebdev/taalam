
-- Mushaf bookmarks table
CREATE TABLE public.mushaf_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_number int NOT NULL,
  surah_number int,
  ayah_key text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mushaf_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own mushaf bookmarks"
  ON public.mushaf_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mushaf bookmarks"
  ON public.mushaf_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mushaf bookmarks"
  ON public.mushaf_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mushaf bookmarks"
  ON public.mushaf_bookmarks FOR UPDATE
  USING (auth.uid() = user_id);
