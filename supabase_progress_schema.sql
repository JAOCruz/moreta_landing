-- Client Progress Tracking Schema
-- Add these tables to your Supabase database

-- 1. Client Profiles (Extended profile information)
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  date_of_birth DATE,
  gender TEXT,

  -- Health Information
  health_conditions TEXT[],
  injuries TEXT[],
  medications TEXT[],
  medical_notes TEXT,

  -- Fitness Goals
  primary_goal TEXT, -- 'weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'
  target_weight DECIMAL(5,2),
  target_date DATE,
  motivation_notes TEXT,

  -- Preferences
  preferred_workout_time TEXT,
  workout_frequency_goal INTEGER, -- sessions per week

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core measurements (in cm)
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),

  -- Circumferences (in cm)
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  bicep_left DECIMAL(5,2),
  bicep_right DECIMAL(5,2),
  thigh_left DECIMAL(5,2),
  thigh_right DECIMAL(5,2),
  calf_left DECIMAL(5,2),
  calf_right DECIMAL(5,2),

  -- Additional metrics
  bmi DECIMAL(4,2),
  notes TEXT,

  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  photo_type TEXT, -- 'front', 'back', 'side', 'other'
  caption TEXT,
  is_public BOOLEAN DEFAULT FALSE,

  -- Link to measurement if taken on same day
  measurement_id UUID REFERENCES body_measurements(id),

  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workout Logs (Performance Tracking)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id),
  session_id UUID REFERENCES sessions(id),

  workout_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Overall workout metrics
  total_volume INTEGER, -- total weight lifted (sets * reps * weight)
  calories_burned INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exercise Logs (Individual exercise performance)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  exercise_name TEXT NOT NULL,
  exercise_order INTEGER, -- order in workout

  -- Performance data (stored as arrays for multiple sets)
  sets_completed INTEGER,
  reps INTEGER[], -- array of reps per set
  weight DECIMAL(6,2)[], -- array of weights per set (in kg)
  rest_seconds INTEGER[], -- rest time between sets

  -- Form and completion
  form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 5),
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Personal Records (PRs)
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,

  record_type TEXT, -- 'one_rep_max', 'max_reps', 'max_volume', 'best_time'
  value DECIMAL(10,2),
  unit TEXT, -- 'kg', 'lbs', 'reps', 'seconds'

  exercise_log_id UUID REFERENCES exercise_logs(id),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_name, record_type)
);

-- 7. Goals and Milestones
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT, -- 'weight', 'strength', 'endurance', 'habit', 'custom'

  -- Target values
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  unit TEXT,

  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,

  status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  priority INTEGER DEFAULT 1, -- 1-5

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Check-in Notes (Coach-Client Communication)
CREATE TABLE IF NOT EXISTS checkin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES auth.users(id),

  note_type TEXT, -- 'coach_note', 'client_feedback', 'milestone', 'concern'
  subject TEXT,
  content TEXT NOT NULL,

  -- Related records
  workout_log_id UUID REFERENCES workout_logs(id),
  goal_id UUID REFERENCES client_goals(id),

  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_body_measurements_user ON body_measurements(user_id, measured_at DESC);
CREATE INDEX idx_progress_photos_user ON progress_photos(user_id, taken_at DESC);
CREATE INDEX idx_workout_logs_user ON workout_logs(user_id, workout_date DESC);
CREATE INDEX idx_exercise_logs_workout ON exercise_logs(workout_log_id);
CREATE INDEX idx_personal_records_user ON personal_records(user_id, exercise_name);
CREATE INDEX idx_client_goals_user ON client_goals(user_id, status);

-- Row Level Security (RLS) Policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_notes ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own data
CREATE POLICY "Users can view own client profile" ON client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own client profile" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own client profile" ON client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own measurements" ON body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements" ON body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own measurements" ON body_measurements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own photos" ON progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos" ON progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON progress_photos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout logs" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise logs" ON exercise_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise logs" ON exercise_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own PRs" ON personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own PRs" ON personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON client_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON client_goals FOR ALL USING (auth.uid() = user_id);

-- Admins can view all client data (add admin check function)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "Admins can view all profiles" ON client_profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all measurements" ON body_measurements FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all workout logs" ON workout_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all goals" ON client_goals FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage checkin notes" ON checkin_notes FOR ALL USING (is_admin() OR auth.uid() = client_id);
