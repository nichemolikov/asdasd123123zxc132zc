# Fix: dashboard_overview 404 Error

## 🚨 Error

```
POST .../rpc/dashboard_overview 404 (Not Found)
```

## ✅ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### Step 2: Run Quick Fix Script

Copy and paste the entire contents of:
```
supabase/QUICK_FIX_DASHBOARD_OVERVIEW.sql
```

Then click **"Run"** (or press Ctrl+Enter).

### Step 3: Verify

Run this to check if function was created:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'dashboard_overview';
```

Should return 1 row.

### Step 4: Refresh App

1. Refresh your browser (F5)
2. Check console - 404 error should be gone
3. Dashboard should load properly

## 🔍 What This Does

The script creates:
1. `user_has_workspace_access()` - Helper function for security
2. `dashboard_overview()` - Main function that returns dashboard stats

## 📋 Alternative: Run Full Migration

If you want all RPC functions, run the complete migration:

1. Open Supabase SQL Editor
2. Copy entire contents of: `supabase/migrations/20250101000001_rpc_functions.sql`
3. Paste and run

This creates all functions:
- `signup_bootstrap`
- `me`
- `current_workspace`
- `dashboard_overview`
- `get_instagram_account_details`
- `invite_member`

## ⚠️ Still Getting Errors?

### Check if function exists:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'dashboard_overview';
```

### Check for syntax errors:
- Look at error message in SQL Editor
- Common issues: missing tables, wrong column names

### Test the function:
```sql
-- Get your workspace ID first
SELECT id FROM public.workspaces LIMIT 1;

-- Then test (replace with your workspace ID)
SELECT public.dashboard_overview('your-workspace-id-here');
```

## 🎯 Expected Result

After running the fix:
- ✅ No more 404 errors in console
- ✅ Dashboard loads properly
- ✅ Stats display correctly (even if 0 for new accounts)

