
-- Fix: restrict notification_log insert to authenticated users with their own user_id
DROP POLICY "Service can insert notifications" ON public.notification_log;
CREATE POLICY "Authenticated can insert own notifications" ON public.notification_log FOR INSERT WITH CHECK (auth.uid() = user_id);
