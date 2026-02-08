-- MORETA TACTICAL HUD SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  client TEXT,
  day TEXT, -- New: e.g. LUN, MAR, etc.
  time TEXT,
  detail TEXT,
  status TEXT DEFAULT 'empty',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROUTINES TABLE
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WELLNESS TABLE (Daily Log)
CREATE TABLE IF NOT EXISTS wellness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours DECIMAL(4,1) DEFAULT 0,
  stress_level TEXT DEFAULT 'LOW',
  water_liters DECIMAL(4,1) DEFAULT 0,
  diet_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE REALTIME FOR ALL TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;
ALTER PUBLICATION supabase_realtime ADD TABLE wellness;

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (Users can only see/edit their own data)
CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payments" ON payments FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own routines" ON routines FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wellness" ON wellness FOR ALL TO authenticated USING (auth.uid() = user_id);

-- SEED DATA FOR FIRST TRAINER (Optional but recommended)
-- Replace user_id with your own user_id if you want initial data
/*
INSERT INTO sessions (user_id, time, client, detail, status) 
VALUES 
  ('YOU-USER-ID', '09:00', 'JUAN PEREZ', 'BRAZOS // HYPER', 'filled'),
  ('YOU-USER-ID', '14:00', 'SLOT VACÍO', 'DISPONIBLE', 'empty');
*/
