# Supabase Database Setup - Step by Step Guide

## Issue: "Could not find the table 'public.users' in the schema cache"

This error means the database tables haven't been created yet, or the Supabase client types are out of sync.

## Step-by-Step Solution

### Step 1: Verify Tables Exist

Run this query in **Supabase Dashboard → SQL Editor** to check if tables exist:

```sql
-- Check if tables exist
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 
    'workspaces', 
    'workspace_users', 
    'subscription_plans', 
    'subscriptions',
    'instagram_accounts',
    'scheduled_posts',
    'analytics_snapshots',
    'post_performances',
    'alerts'
)
ORDER BY table_name;
```

**Expected Result:** Should show all 10 tables. If any are missing, proceed to Step 2.

### Step 2: Run Migrations in Order

#### Migration 1: Workspace Multi-Tenant Schema

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of: `supabase/migrations/20250101000000_workspace_multi_tenant.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for success message: ✅ "Success. No rows returned"

**If you get errors:**
- Read the error message carefully
- Common issues:
  - Tables already exist → That's OK, the migration handles this
  - Foreign key constraint errors → Make sure you run migrations in order
  - Permission errors → Check you're using the correct database role

#### Migration 2: RPC Functions

1. Still in **SQL Editor**
2. Click **"New query"** (or clear the previous one)
3. Copy the entire contents of: `supabase/migrations/20250101000001_rpc_functions.sql`
4. Paste into the SQL Editor
5. Click **"Run"**
6. Wait for success message

### Step 3: Verify Tables Were Created

Run this query again to confirm:

```sql
-- Verify all tables exist
SELECT 
    'users' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'workspaces', 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'workspaces'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'workspace_users',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'workspace_users'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'subscription_plans',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'subscription_plans'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'subscriptions',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'instagram_accounts',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'instagram_accounts'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'scheduled_posts',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'scheduled_posts'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'analytics_snapshots',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'analytics_snapshots'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'post_performances',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'post_performances'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'alerts',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'alerts'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END;
```

**Expected Result:** All should show "✅ EXISTS"

### Step 4: Regenerate TypeScript Types

After running migrations, you need to update the TypeScript types:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase dashboard)
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

#### Option B: Using Supabase Dashboard

1. Go to **Supabase Dashboard → Settings → API**
2. Scroll to **"TypeScript types"**
3. Click **"Generate types"**
4. Copy the generated types
5. Replace contents of `src/integrations/supabase/types.ts`

#### Option C: Manual Fix (Quick)

If you just need to fix the immediate error, you can temporarily update the types file to include the users table structure.

### Step 5: Verify RPC Functions

Check if RPC functions were created:

```sql
-- Check RPC functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'signup_bootstrap',
    'me',
    'current_workspace',
    'dashboard_overview',
    'get_instagram_account_details',
    'invite_member',
    'user_has_workspace_access'
)
ORDER BY routine_name;
```

**Expected Result:** Should show all 7 functions

### Step 6: Test Connection

1. Restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. Open your app and go to **Settings → Connection** tab
3. Click **"Test Connection"**
4. Should show all green checkmarks ✅

## Troubleshooting

### Error: "relation already exists"
**Solution:** This is OK! The migration uses `CREATE TABLE IF NOT EXISTS` and handles existing tables.

### Error: "permission denied"
**Solution:** Make sure you're running queries in the SQL Editor (not via API). The SQL Editor has admin privileges.

### Error: "foreign key constraint"
**Solution:** Make sure you run migrations in order:
1. First: `20250101000000_workspace_multi_tenant.sql`
2. Then: `20250101000001_rpc_functions.sql`

### Error: "column does not exist"
**Solution:** The migration handles column additions. If you get this error, it might be a timing issue. Try running the migration again.

### Types still showing errors
**Solution:** 
1. Regenerate types (Step 4)
2. Restart your IDE/editor
3. Restart TypeScript server (VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")

## Quick Diagnostic Query

Run this to see the current state of your database:

```sql
-- Full database diagnostic
SELECT 
    'Tables' as category,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'RPC Functions',
    COUNT(*)
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
UNION ALL
SELECT 
    'RLS Policies',
    COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public';
```

## Next Steps After Setup

1. ✅ Tables created
2. ✅ RPC functions created
3. ✅ Types regenerated
4. ✅ Connection test passes
5. **Test signup flow** - Create a new user account
6. **Verify workspace creation** - Check `workspaces` table after signup
7. **Test adding Instagram account** - Verify it appears in `instagram_accounts` table

## Need More Help?

If you're still getting errors:
1. Copy the exact error message
2. Check which step failed
3. Run the diagnostic query above
4. Share the results for further assistance

