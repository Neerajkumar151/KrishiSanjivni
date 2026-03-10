-- Comprehensive role reset to 'farmer'
-- 1. Reset base role in profiles table
UPDATE public.profiles 
SET role = 'farmer'::user_role;

-- 2. Reset administrative roles in user_roles table
-- (Optional: you may want to keep one admin, but user asked for "everyone")
UPDATE public.user_roles
SET role = 'farmer'::app_role;

-- 3. If any users are missing a role entry in user_roles, we can ensure they have one
-- but usually the system defaults them to farmer if no entry exists.
