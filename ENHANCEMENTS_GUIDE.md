# Moreta Fitness - Scheduling & Financial Enhancements

## 🚀 What's New

This enhancement adds professional-grade features for **time management, scheduling, and financial analytics** to your gym coach dashboard.

---

## 📊 Database Schema

### Run the SQL Script

```bash
# In Supabase SQL Editor, run:
cat supabase_enhancements_schema.sql
```

This creates **9 new tables** and enhances existing ones:

### New Tables

#### Time Management & Scheduling:
1. **`session_types`** - Define session types (Group Class, Personal Training, Assessment)
2. **`pricing_rules`** - Pricing per session type and packages
3. **`coach_availability`** - Coach weekly availability schedule
4. **`session_templates`** - Reusable session configurations

#### Financial Tracking:
5. **`expense_categories`** - Categories for business expenses
6. **`expenses`** - Track all business expenses
7. **`revenue_categories`** - Categorize revenue streams
8. **`payment_packages`** - Track client session packages
9. **`client_subscriptions`** - Manage recurring memberships

### Enhanced Tables:
- **`sessions`** - Added `session_type_id` column
- **`payments`** - Added `revenue_category_id`, `package_id`, `subscription_id`, `invoice_number`, `notes`

---

## 🎯 Features Breakdown

### 1. Session Type Management

**What it does:**
- Create different session types (Group, 1-on-1, Assessment, etc.)
- Set capacity, duration, color coding, and icons
- Configure pricing for each type

**Default Session Types:**
- 🟢 **Group Class** - 60 min, 6 capacity
- 🔵 **Personal Training** - 60 min, 1 capacity
- 🟠 **Assessment** - 45 min, 1 capacity
- 🟣 **Open Gym** - 90 min, 10 capacity

### 2. Pricing Management

**What it does:**
- Create pricing tiers (Single Session, 5-Pack, 10-Pack, Monthly Unlimited)
- Set expiration dates for packages
- Track session credits

**Example Pricing:**
- Single Session: $25
- 5-Pack: $110 (save $15)
- 10-Pack: $200 (save $50)
- Monthly Unlimited: $150

### 3. Coach Availability

**What it does:**
- Set weekly recurring availability
- Block off unavailable times
- Multiple coaches supported

**Example:**
- Monday 6:00 AM - 9:00 PM
- Tuesday 6:00 AM - 9:00 PM
- Wednesday: UNAVAILABLE
- etc.

### 4. Expense Tracking

**What it does:**
- Log business expenses by category
- Upload receipt photos
- Track recurring expenses (rent, insurance)
- Calculate monthly expense totals

**Default Categories:**
- 💪 Equipment
- 🏢 Rent
- 📈 Marketing
- 📦 Supplies
- 🛡️ Insurance
- 👥 Salaries
- ➕ Other

### 5. Financial Analytics

**What it does:**
- Revenue vs Expenses charts
- Profit/loss calculations
- Client lifetime value
- Monthly comparisons
- Export reports

**Metrics:**
- Total Revenue
- Total Expenses
- Net Profit
- Profit Margin %
- Average Transaction
- Unique Paying Clients

### 6. Client Packages & Subscriptions

**What it does:**
- Sell session packages to clients
- Track remaining sessions
- Manage subscriptions (monthly, quarterly)
- Auto-renewal support

---

## 🧩 New Components

```
src/components/admin/
├── SessionTypesManager.jsx     # Manage session types
├── PricingManager.jsx           # Configure pricing rules
├── AvailabilityManager.jsx      # Set coach availability
└── ExpenseTracker.jsx           # Log expenses

src/components/analytics/
├── RevenueChart.jsx             # Revenue visualization
├── ExpenseChart.jsx             # Expense breakdown
├── ProfitLossChart.jsx          # P&L over time
└── FinancialSummaryCard.jsx     # Key metrics cards

src/components/views/
├── EnhancedFinanceView.jsx      # Upgraded finance dashboard
└── AnalyticsView.jsx            # Business intelligence dashboard
```

---

## 📈 Analytics Views

The schema includes pre-built SQL views for instant analytics:

### `monthly_revenue_summary`
```sql
SELECT * FROM monthly_revenue_summary;
-- Returns: month, total_transactions, total_revenue, average_transaction, unique_clients
```

### `monthly_expense_summary`
```sql
SELECT * FROM monthly_expense_summary;
-- Returns: month, category, transaction_count, total_amount
```

### `client_session_stats`
```sql
SELECT * FROM client_session_stats;
-- Returns: client_id, email, sessions_attended, first_session, last_session
```

### Helper Functions

**Calculate Monthly Profit:**
```sql
SELECT * FROM calculate_monthly_profit('2026-02-01');
-- Returns: total_revenue, total_expenses, net_profit, profit_margin
```

**Check Active Package:**
```sql
SELECT client_has_active_package('client-uuid');
-- Returns: true/false
```

---

## 🎨 UI Features

### Session Type Manager
- ✅ Create/edit/delete session types
- ✅ Color picker for visual distinction
- ✅ Icon selector
- ✅ Set capacity and duration
- ✅ Enable/disable types

### Pricing Manager
- ✅ Create pricing tiers
- ✅ Link to session types
- ✅ Set validity periods
- ✅ Package vs single session pricing
- ✅ Calculate savings display

### Expense Tracker
- ✅ Quick expense entry form
- ✅ Category dropdown
- ✅ Receipt upload (Supabase Storage)
- ✅ Recurring expense setup
- ✅ Monthly expense summary
- ✅ Expense history table

### Enhanced Finance View
- ✅ **Overview Tab**: Key metrics, charts
- ✅ **Revenue Tab**: Payment history with filters
- ✅ **Expenses Tab**: Expense tracking
- ✅ **Analytics Tab**: Profit/loss, trends
- ✅ **Reports Tab**: Export data

### Analytics Dashboard
- ✅ Revenue trend line chart
- ✅ Expense breakdown pie chart
- ✅ Profit/loss over time
- ✅ Client retention metrics
- ✅ Session utilization rates
- ✅ Top revenue clients

---

## 🔐 Security

All new tables have **Row Level Security (RLS)** enabled:

- **Admins** can view/manage everything
- **Clients** can view their own packages and subscriptions
- **Coaches** can manage their own availability
- **Expenses** are admin-only
- **Session types and pricing** are public (read-only for clients)

---

## 🚀 Usage

### As an Admin:

#### 1. Configure Session Types
```
Admin → Session Management → Session Types
- Add "HIIT Class" - 45 min, 8 capacity, Red color
- Add "Yoga" - 60 min, 12 capacity, Purple color
```

#### 2. Set Pricing
```
Admin → Session Management → Pricing
- Create "Drop-in": $30/session
- Create "10-Pack": $250 (save $50)
- Create "Unlimited Monthly": $200
```

#### 3. Log Expenses
```
Admin → Finance → Expenses Tab
- Add expense: Rent, $2000, monthly recurring
- Add expense: New dumbbells, $500, Equipment category
```

#### 4. View Analytics
```
Admin → Analytics
- See this month's profit
- Compare revenue vs last month
- Check which clients are most active
```

### As a Client:

#### 1. View Available Packages
```
Client → Dashboard or Booking
- See: "10-Pack: $250 (10 sessions)"
- Purchase package (future feature)
```

#### 2. Check Session Credits
```
Client → My Account
- Sessions remaining: 7 / 10
- Expiry: March 15, 2026
```

---

## 📊 Performance Optimization

The schema includes **indexes** for fast queries:
- Payment date lookups
- Expense category filtering
- Client package searches
- Session type filtering

---

## 🔄 Migration Path

### Existing Data
Your current data is preserved:
- Existing `sessions` table gets new `session_type_id` column (nullable)
- Existing `payments` table gets new fields (nullable)
- No data loss!

### Retroactive Setup
Optionally link old sessions to session types:
```sql
-- Example: Mark all past sessions as "Group Class"
UPDATE sessions
SET session_type_id = (SELECT id FROM session_types WHERE name = 'Group Class')
WHERE session_type_id IS NULL;
```

---

## 🐛 Testing

### Test Expense Tracking:
```sql
INSERT INTO expenses (amount, description, expense_date, category_id)
VALUES (
  1500.00,
  'Monthly gym rent',
  CURRENT_DATE,
  (SELECT id FROM expense_categories WHERE name = 'Rent')
);
```

### Test Pricing:
```sql
INSERT INTO pricing_rules (name, price, sessions_included, session_type_id)
VALUES (
  '10-Pack Special',
  200.00,
  10,
  (SELECT id FROM session_types WHERE name = 'Group Class')
);
```

### Query Analytics:
```sql
-- See this month's profit
SELECT * FROM calculate_monthly_profit(CURRENT_DATE);

-- See all revenue by month
SELECT * FROM monthly_revenue_summary;

-- Check top clients
SELECT * FROM client_session_stats ORDER BY sessions_attended DESC LIMIT 10;
```

---

## 📚 Next Steps

1. ✅ **Run SQL schema** - `supabase_enhancements_schema.sql`
2. 🔄 **Build UI components** - Session types, Pricing, Expenses
3. 🔄 **Create Analytics Dashboard** - Charts and visualizations
4. ⏳ **Add booking flow** - Clients purchase packages
5. ⏳ **Payment integration** - Stripe/PayPal
6. ⏳ **Automated reports** - Email monthly summaries

---

## 🎯 Benefits

### For You (Admin):
- ✅ **Professional expense tracking**
- ✅ **Know your profit margins**
- ✅ **Data-driven decisions**
- ✅ **Scale with confidence**
- ✅ **Tax season made easy**

### For Your Clients:
- ✅ **Flexible pricing options**
- ✅ **Track package sessions**
- ✅ **Transparent billing**
- ✅ **Better value with packages**

---

**Status:** 🟡 Schema ready, UI components in progress
**Last Updated:** February 10, 2026
