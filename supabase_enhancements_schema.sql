-- =====================================================
-- MORETA FITNESS - SCHEDULING & FINANCIAL ENHANCEMENTS
-- =====================================================
-- Run this in your Supabase SQL Editor
-- Adds: Session types, Pricing, Availability, Expenses, Analytics

-- =====================================================
-- PART 1: TIME MANAGEMENT & SCHEDULING ENHANCEMENTS
-- =====================================================

-- Session Types (group class, 1-on-1, assessment, etc.)
CREATE TABLE IF NOT EXISTS session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_capacity INTEGER NOT NULL DEFAULT 1,
  color VARCHAR(7) DEFAULT '#10b981', -- Hex color for UI
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(50), -- lucide icon name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type_id UUID REFERENCES session_types(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Single Session", "10-Pack", "Monthly Unlimited"
  price DECIMAL(10,2) NOT NULL,
  sessions_included INTEGER, -- NULL for unlimited
  validity_days INTEGER, -- How long the package is valid
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach Availability (recurring weekly schedule)
CREATE TABLE IF NOT EXISTS coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, day_of_week, start_time)
);

-- Session Templates (reusable session configurations)
CREATE TABLE IF NOT EXISTS session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  session_type_id UUID REFERENCES session_types(id) ON DELETE SET NULL,
  description TEXT,
  default_capacity INTEGER DEFAULT 4,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add session_type_id to existing sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS session_type_id UUID REFERENCES session_types(id) ON DELETE SET NULL;

-- =====================================================
-- PART 2: FINANCIAL TRACKING ENHANCEMENTS
-- =====================================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#ef4444',
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor VARCHAR(200),
  receipt_url TEXT, -- Supabase Storage URL for receipt photo
  payment_method VARCHAR(50), -- "cash", "credit_card", "bank_transfer"
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20), -- "monthly", "quarterly", "yearly"
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Categories
CREATE TABLE IF NOT EXISTS revenue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Packages (clients purchase these)
CREATE TABLE IF NOT EXISTS payment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_rule_id UUID REFERENCES pricing_rules(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sessions_remaining INTEGER NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- "active", "expired", "used"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Subscriptions (recurring payments)
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pricing_rule_id UUID REFERENCES pricing_rules(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  billing_frequency VARCHAR(20) NOT NULL, -- "weekly", "monthly", "quarterly"
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- "active", "paused", "cancelled"
  auto_renew BOOLEAN DEFAULT true,
  last_billing_date DATE,
  next_billing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance existing payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS revenue_category_id UUID REFERENCES revenue_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES payment_packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES client_subscriptions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- PART 3: INITIAL DATA SEEDING
-- =====================================================

-- Insert default session types
INSERT INTO session_types (name, description, duration_minutes, max_capacity, color, icon) VALUES
  ('Group Class', 'Standard group fitness class', 60, 6, '#10b981', 'Users'),
  ('Personal Training', 'One-on-one personal training', 60, 1, '#3b82f6', 'User'),
  ('Assessment', 'Initial fitness assessment', 45, 1, '#f59e0b', 'ClipboardCheck'),
  ('Open Gym', 'Self-directed gym access', 90, 10, '#6366f1', 'Dumbbell')
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO expense_categories (name, description, color, icon) VALUES
  ('Equipment', 'Gym equipment and maintenance', '#ef4444', 'Dumbbell'),
  ('Rent', 'Facility rent and utilities', '#f97316', 'Building'),
  ('Marketing', 'Advertising and promotions', '#8b5cf6', 'TrendingUp'),
  ('Supplies', 'Cleaning and office supplies', '#06b6d4', 'Package'),
  ('Insurance', 'Business insurance', '#14b8a6', 'Shield'),
  ('Salaries', 'Staff salaries and wages', '#f43f5e', 'Users'),
  ('Other', 'Miscellaneous expenses', '#64748b', 'MoreHorizontal')
ON CONFLICT (name) DO NOTHING;

-- Insert default revenue categories
INSERT INTO revenue_categories (name, description) VALUES
  ('Session Fees', 'Individual session payments'),
  ('Package Sales', 'Multi-session package purchases'),
  ('Subscriptions', 'Monthly/recurring memberships'),
  ('Merchandise', 'Product sales'),
  ('Other', 'Miscellaneous income')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PART 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

-- Session Types - Everyone can view, only admins can modify
CREATE POLICY "Everyone can view session types" ON session_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage session types" ON session_types FOR ALL USING (is_admin());

-- Pricing Rules - Everyone can view, only admins can modify
CREATE POLICY "Everyone can view pricing" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing" ON pricing_rules FOR ALL USING (is_admin());

-- Coach Availability - Everyone can view, coaches and admins can modify their own
CREATE POLICY "Everyone can view availability" ON coach_availability FOR SELECT USING (true);
CREATE POLICY "Coaches manage own availability" ON coach_availability FOR ALL
  USING (auth.uid() = coach_id OR is_admin());

-- Session Templates - Everyone can view, admins can manage
CREATE POLICY "Everyone can view templates" ON session_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON session_templates FOR ALL USING (is_admin());

-- Expense Categories - Everyone can view, admins can manage
CREATE POLICY "Everyone can view expense categories" ON expense_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage expense categories" ON expense_categories FOR ALL USING (is_admin());

-- Expenses - Only admins can view and manage
CREATE POLICY "Admins can view expenses" ON expenses FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage expenses" ON expenses FOR ALL USING (is_admin());

-- Revenue Categories - Everyone can view, admins can manage
CREATE POLICY "Everyone can view revenue categories" ON revenue_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage revenue categories" ON revenue_categories FOR ALL USING (is_admin());

-- Payment Packages - Clients see their own, admins see all
CREATE POLICY "Clients view own packages" ON payment_packages FOR SELECT
  USING (auth.uid() = client_id OR is_admin());
CREATE POLICY "Admins manage packages" ON payment_packages FOR ALL USING (is_admin());

-- Client Subscriptions - Clients see their own, admins see all
CREATE POLICY "Clients view own subscriptions" ON client_subscriptions FOR SELECT
  USING (auth.uid() = client_id OR is_admin());
CREATE POLICY "Admins manage subscriptions" ON client_subscriptions FOR ALL USING (is_admin());

-- =====================================================
-- PART 5: USEFUL VIEWS FOR ANALYTICS
-- =====================================================

-- Monthly Revenue Summary View
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_transactions,
  SUM(amount) as total_revenue,
  AVG(amount) as average_transaction
FROM payments
WHERE status = 'pagado'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Monthly Expense Summary View
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT
  DATE_TRUNC('month', expense_date) as month,
  ec.name as category,
  COUNT(*) as transaction_count,
  SUM(e.amount) as total_amount
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
GROUP BY DATE_TRUNC('month', expense_date), ec.name
ORDER BY month DESC, total_amount DESC;

-- Client Session Attendance View
CREATE OR REPLACE VIEW client_session_stats AS
SELECT
  p.id as client_id,
  p.email,
  p.full_name,
  COUNT(DISTINCT s.id) as sessions_attended,
  COUNT(DISTINCT DATE(s.date)) as unique_days,
  MIN(s.date) as first_session,
  MAX(s.date) as last_session
FROM profiles p
CROSS JOIN LATERAL (
  SELECT s.id, s.date
  FROM sessions s
  WHERE s.participants @> jsonb_build_array(jsonb_build_object('id', p.id))
) s
WHERE p.role = 'client'
GROUP BY p.id, p.email, p.full_name;

-- =====================================================
-- PART 6: HELPER FUNCTIONS
-- =====================================================

-- Function to calculate profit for a month
CREATE OR REPLACE FUNCTION calculate_monthly_profit(target_month DATE)
RETURNS TABLE (
  month DATE,
  total_revenue DECIMAL(10,2),
  total_expenses DECIMAL(10,2),
  net_profit DECIMAL(10,2),
  profit_margin DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH revenue AS (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM payments
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', target_month)
      AND status = 'pagado'
  ),
  expenses AS (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', target_month)
  )
  SELECT
    DATE_TRUNC('month', target_month)::DATE,
    revenue.total,
    expenses.total,
    (revenue.total - expenses.total),
    CASE
      WHEN revenue.total > 0 THEN ((revenue.total - expenses.total) / revenue.total * 100)
      ELSE 0
    END
  FROM revenue, expenses;
END;
$$ LANGUAGE plpgsql;

-- Function to check if client has active package
CREATE OR REPLACE FUNCTION client_has_active_package(client_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM payment_packages
    WHERE client_id = client_uuid
      AND status = 'active'
      AND sessions_remaining > 0
      AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 7: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_packages_client ON payment_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_packages_status ON payment_packages(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON client_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type_id);
CREATE INDEX IF NOT EXISTS idx_coach_availability_coach ON coach_availability(coach_id);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Next steps:
-- 1. Build UI components for session type management
-- 2. Create pricing configuration interface
-- 3. Add expense tracking forms
-- 4. Build financial analytics dashboard with charts
-- 5. Implement revenue reports
