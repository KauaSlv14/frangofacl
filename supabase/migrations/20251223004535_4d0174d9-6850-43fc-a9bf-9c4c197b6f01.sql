-- Add 'customer' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- Add unique constraint on profiles.phone (email is already in auth.users)
-- First, ensure no duplicate phones exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
  END IF;
END $$;