-- Drop existing SELECT policies that may have incorrect restrictive behavior
DROP POLICY IF EXISTS "Admins can view all admin requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Users can view own request" ON public.admin_requests;

-- Create new PERMISSIVE SELECT policies with correct OR logic
-- Users can only see their own admin request
CREATE POLICY "Users can view own admin request"
ON public.admin_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all admin requests
CREATE POLICY "Admins can view all admin requests"
ON public.admin_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));