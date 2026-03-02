
-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;

-- Recreate as PERMISSIVE
CREATE POLICY "Authenticated users can create families"
ON public.families
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
