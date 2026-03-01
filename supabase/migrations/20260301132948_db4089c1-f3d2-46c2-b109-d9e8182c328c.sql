
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notification_log;

-- Replace with a policy that only allows service_role inserts
CREATE POLICY "Service role can insert notifications"
ON public.notification_log
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');
