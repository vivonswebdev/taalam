DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.app_events;

CREATE POLICY "Authenticated users can insert own events"
  ON public.app_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);