# 🚀 Setup Guide - Enhanced Features

## ✅ What's Been Added

Your gym coach dashboard now has **professional-grade financial tracking and scheduling management**!

### New Features:
- 💼 **Session Types Management** - Define different session types
- 💰 **Pricing Rules** - Configure packages and pricing tiers
- 📊 **Expense Tracking** - Track all business expenses
- 📈 **Financial Analytics** - Revenue vs Expenses charts, profit calculations
- 🎯 **Business Configuration** - Centralized admin settings

---

## 📋 Step-by-Step Setup

### Step 1: Run the Database Schema ✅

Open your **Supabase Dashboard** → **SQL Editor** and run this file:

```bash
supabase_enhancements_schema.sql
```

This will create:
- 9 new tables for scheduling and financial features
- Default session types (Group Class, Personal Training, Assessment, Open Gym)
- Default expense categories (Equipment, Rent, Marketing, etc.)
- Default revenue categories
- Analytics views and helper functions
- Row Level Security policies

**Expected output:** "Success. No rows returned"

---

### Step 2: Verify the Setup

Check that the tables were created:

```sql
-- Run this in Supabase SQL Editor:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'session_types',
    'pricing_rules',
    'expenses',
    'expense_categories',
    'payment_packages',
    'client_subscriptions'
  );
```

You should see all 6 table names listed.

---

### Step 3: Verify Default Data

```sql
-- Check session types
SELECT * FROM session_types;

-- Check expense categories
SELECT * FROM expense_categories;

-- Check revenue categories
SELECT * FROM revenue_categories;
```

You should see the default entries for each table.

---

## 🎮 Using the New Features

### As an Admin:

#### 1. **Business Configuration**
Navigate to: **Sidebar → Business**

**Session Types Tab:**
- View existing session types (Group Class, Personal Training, etc.)
- Create new session types:
  - Name: e.g., "HIIT Class"
  - Duration: e.g., 45 minutes
  - Max Capacity: e.g., 8 people
  - Color: Pick a color for visual distinction
  - Description: Brief description
  - Active/Inactive toggle

**Pricing Rules Tab:**
- View existing pricing
- Create new pricing packages:
  - Package Name: e.g., "10-Pack Special"
  - Session Type: Select which type (or "All Types")
  - Price: e.g., $200
  - Sessions Included: e.g., 10 (leave empty for unlimited)
  - Valid For: e.g., 90 days
  - Description: Optional terms

#### 2. **Enhanced Finance Dashboard**
Navigate to: **Sidebar → Finance**

**Overview Tab:**
- See key metrics cards:
  - This Month Revenue
  - Total Revenue
  - Average Transaction
  - Paying Clients
- View Revenue vs Expenses chart
- Recent transactions list

**Revenue Tab:**
- Full payment history (existing functionality)
- Register new payments
- Edit/delete payments

**Expenses Tab:**
- Summary cards (This Month, Total, Transactions)
- Add New Expense button
- Log expenses:
  - Amount
  - Category (Equipment, Rent, Marketing, etc.)
  - Date
  - Vendor/Payee
  - Payment Method (Cash, Credit Card, etc.)
  - Recurring expense checkbox
  - Description
- Recent expenses list with delete option

**Analytics Tab:**
- Revenue vs Expenses line chart
- Net Profit calculation
- Profit Margin percentage
- Revenue by Month breakdown
- Expenses by Category breakdown

---

## 📊 Understanding the Analytics

### Key Metrics:

**Total Revenue** - Sum of all "pagado" (paid) payments

**Total Expenses** - Sum of all logged expenses

**Net Profit** - Revenue minus Expenses

**Profit Margin** - (Net Profit / Revenue) × 100

**Average Transaction** - Total Revenue / Number of Payments

**Paying Clients** - Unique clients who have made payments

### Charts:

**Revenue vs Expenses Chart:**
- Green line = Revenue over time
- Red line = Expenses over time
- Shows last 6 months by default
- Hover over data points to see exact values

---

## 💡 Usage Examples

### Example 1: Setting Up Your Business

1. **Define your session types:**
   ```
   Business → Session Types → Add New
   - Group Fitness: 60 min, 10 capacity, Green
   - 1-on-1 PT: 60 min, 1 capacity, Blue
   - Intro Session: 30 min, 1 capacity, Yellow
   ```

2. **Create pricing packages:**
   ```
   Business → Pricing Rules → Add New
   - Drop-in: $30, 1 session
   - 5-Pack: $135, 5 sessions, 30 days validity
   - 10-Pack: $250, 10 sessions, 60 days validity
   - Monthly Unlimited: $200, unlimited, 30 days validity
   ```

3. **Start tracking expenses:**
   ```
   Finance → Expenses → Add Expense
   - Gym Rent: $2000/month, Recurring monthly
   - Equipment Purchase: $500, one-time
   - Marketing: $150/month, Recurring monthly
   ```

### Example 2: Monthly Financial Review

1. Go to **Finance → Analytics**
2. Check the **Revenue vs Expenses** chart
3. Note your **Net Profit** and **Profit Margin**
4. Review **Revenue by Month** - identify trends
5. Check **Expenses by Category** - find cost-cutting opportunities

---

## 🔍 Troubleshooting

### Issue: "Table does not exist" error

**Solution:** Run the SQL schema file in Supabase SQL Editor

### Issue: Can't see expenses or session types

**Solution:** Check RLS policies are enabled:
```sql
-- Run in Supabase:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('expenses', 'session_types');
```

Should show `rowsecurity = true` for both.

### Issue: Analytics not showing data

**Solution:**
1. Make sure you have payments with `status = 'pagado'`
2. Make sure expenses have been logged
3. Check the views exist:
```sql
SELECT * FROM monthly_revenue_summary;
SELECT * FROM monthly_expense_summary;
```

### Issue: Can't create session types or pricing

**Solution:** Verify you're logged in as admin:
```sql
SELECT id, email, role FROM profiles WHERE id = auth.uid();
```

Should show `role = 'admin'`

---

## 📁 New Files Added

### Database:
- `supabase_enhancements_schema.sql` - Complete database schema

### Components:
```
src/components/admin/
├── SessionTypesManager.jsx
├── PricingManager.jsx
└── ExpenseTracker.jsx

src/components/analytics/
├── RevenueExpenseChart.jsx
└── FinancialSummaryCard.jsx

src/components/views/
├── EnhancedFinanceView.jsx
└── AdminSettingsView.jsx
```

### Documentation:
- `ENHANCEMENTS_GUIDE.md` - Detailed feature documentation
- `SETUP_GUIDE.md` - This file

---

## 🎯 Next Steps

### Immediate:
1. ✅ Run the SQL schema
2. ✅ Verify setup in Supabase
3. ✅ Refresh your app
4. ✅ Navigate to "Business" in sidebar
5. ✅ Configure your session types and pricing

### Short-term:
- Start logging all expenses
- Register all payments properly
- Review analytics weekly

### Future Enhancements (Not yet implemented):
- Client package purchasing (frontend booking flow)
- Payment integration (Stripe/PayPal)
- Coach availability management
- Automated financial reports via email
- Session type selection when creating sessions
- Package credit system for clients

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the console for errors (F12 → Console)
2. Verify all SQL ran successfully
3. Check RLS policies are enabled
4. Confirm you're logged in as admin
5. Review the `ENHANCEMENTS_GUIDE.md` for detailed documentation

---

## 🎉 You're All Set!

Your gym coach dashboard now has:
- ✅ Professional financial tracking
- ✅ Business expense management
- ✅ Revenue analytics and reporting
- ✅ Session type configuration
- ✅ Pricing package management

Start by configuring your business settings, then begin tracking all expenses and revenue to get valuable insights into your gym's financial health!

---

**Last Updated:** February 10, 2026
**Version:** 3.0.0 - Financial & Scheduling Enhancements
**Status:** 🟢 Ready to Use
