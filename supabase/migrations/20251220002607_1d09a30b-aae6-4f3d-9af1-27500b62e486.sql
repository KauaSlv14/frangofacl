-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a permissive policy for public order creation
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also fix the order_items table if needed
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);