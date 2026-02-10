# Fix: Clients Not Showing in Clients View

## Problem
You have 5 registered client users, but the Clients view shows "NO CLIENTS YET".
Error: "column profiles.created_at does not exist"

## Root Cause
The `ClientsView.jsx` component was trying to order results by a `created_at` column that doesn't exist in the `profiles` table.

**Secondary issue**: Row Level Security (RLS) policies also needed to be configured to allow admins to view all profiles.

## Solution

### Step 1: Fix the Query (Already Done!)

The `ClientsView.jsx` file has been updated to remove the non-existent `created_at` ordering.

**Changed:**
```javascript
// Before (broken):
.order('created_at', { ascending: false });

// After (fixed):
// No ordering needed - will show clients by their ID
```

### Step 2: Run the SQL Fix (If RLS Issues Persist)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Fix: Allow admins to view all client profiles

-- Ensure the is_admin() function exists
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

-- Allow admins to manage all profiles
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles"
ON profiles FOR ALL
USING (is_admin());
```

4. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 3: Verify Your Profiles Table

Make sure your client users exist in the `profiles` table:

```sql
-- Check what's in the profiles table
SELECT id, email, role, created_at
FROM profiles
ORDER BY created_at DESC;
```

You should see all your users with their roles.

### Step 4: If Profiles Are Missing

If your client users are NOT in the profiles table (only in auth.users), you need to create profile entries:

```sql
-- Insert missing profiles from auth.users
INSERT INTO profiles (id, email, role, created_at)
SELECT
  id,
  email,
  'client' as role,  -- Default role
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

### Step 5: Refresh the App

1. Refresh your browser (`F5` or `Cmd/Ctrl + R`)
2. Go to **Clients** view
3. You should now see all 5 clients!

## Verification Checklist

- [x] Fixed ClientsView.jsx query (removed created_at ordering)
- [x] Ran the SQL fix in Supabase (RLS policies)
- [x] Verified profiles exist in `profiles` table (6 users: 1 admin, 5 clients)
- [x] Checked that profiles have `role = 'client'`
- [ ] Refreshed the browser
- [ ] Can now see clients in the Clients view

## Debug Mode

The ClientsView now has debug logging. Open your browser's **Console** (F12) and look for:

```
📊 Fetching clients: { profiles: [...], error: null }
```

If you see an error, it will show:
```
❌ Error fetching clients: [error details]
```

## Still Not Working?

If clients still don't show up:

1. **Check you're logged in as admin:**
   ```sql
   SELECT id, email, role FROM profiles WHERE id = auth.uid();
   ```
   Should show `role = 'admin'`

2. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'profiles';
   ```
   Should show `rowsecurity = true`

3. **Check policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

## Quick Test Query

Run this to see what the admin can see:

```sql
-- Logged in as admin, run:
SELECT * FROM profiles WHERE role = 'client';
```

If this returns 0 rows but you know clients exist, the RLS policies are blocking access. Re-run the fix SQL above.

---

**Files modified/created:**
- `src/components/views/ClientsView.jsx` - Removed broken created_at ordering
- `supabase_fix_clients_view.sql` - RLS policy fixes
- `FIX_CLIENTS_VIEW.md` - This guide
