-- =====================================================
-- MORETA.FIT — Jose's Requirements Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- Safe to run multiple times (IF NOT EXISTS guards)
-- =====================================================

-- 1. Add "Por Qué" field — Why is this client training?
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS por_que TEXT;

-- 2. Add goal_type (aesthetic vs health)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'general';

-- 3. Add injury history
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injury_history TEXT;

-- 4. Add experience level
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'beginner';

-- 5. Add phone number (for future WhatsApp integration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 6. Add display name (so we don't rely on email splitting)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 7. Add notes field for coach
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_notes TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('por_que', 'goal_type', 'injury_history', 'experience_level', 'phone', 'display_name', 'coach_notes')
ORDER BY column_name;
