
-- Create table for admin requests (pending admin approvals)
CREATE TABLE public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_requests
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Policies for admin_requests
CREATE POLICY "Admins can view all admin requests"
ON public.admin_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update admin requests"
ON public.admin_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin requests"
ON public.admin_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create admin requests"
ON public.admin_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own request"
ON public.admin_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Fix orders table RLS policies
-- First drop the insecure public policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create new secure policy for authenticated users only
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Fix order_items table RLS policies
-- Drop the insecure public policy
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create secure policy - user can only insert items for their own orders
CREATE POLICY "Authenticated users can create order items for own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id
    AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Users can view their own order items
CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);
