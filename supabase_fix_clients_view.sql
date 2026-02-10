-- Fix: Allow admins to view all client profiles
-- Run this in your Supabase SQL Editor

-- First, let's ensure the is_admin() function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin() OR auth.uid() = id);

-- Also ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow admins to see all users for client management
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles"
ON profiles FOR ALL
USING (is_admin());
