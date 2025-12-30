# Fix: dashboard_overview 404 Error

## Problem

Console shows:
```
POST .../rpc/dashboard_overview 404 (Not Found)
```

This means the `dashboard_overview` RPC function doesn't exist in your database.

## ✅ Solution

Run the RPC functions migration in Supabase SQL Editor.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run the Migration

Copy and paste the entire contents of:
```
supabase/migrations/20250101000001_rpc_functions.sql
```

Then click **"Run"** (or press Ctrl+Enter).

### Step 3: Verify Functions Were Created

Run this query to check:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'signup_bootstrap',
    'current_workspace',
    'dashboard_overview',
    'get_instagram_account_details'
)
ORDER BY routine_name;
```

You should see all 4 functions listed.

### Step 4: Check for Helper Function

The `dashboard_overview` function uses `user_has_workspace_access`. If you get an error about this function not existing, run this first:

```sql
-- Helper function to check workspace access
CREATE OR REPLACE FUNCTION public.user_has_workspace_access(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get user ID
    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if user has access to workspace
    RETURN EXISTS (
        SELECT 1
        FROM public.workspace_users
        WHERE workspace_id = p_workspace_id
        AND user_id = v_user_id
    );
END;
$$;
```

### Step 5: Refresh Your App

After running the migration:
1. Refresh your browser
2. The 404 error should be gone
3. Dashboard should load properly

## Alternative: Simplified Version

If the full migration has issues, you can create a simplified version:

```sql
-- Simplified dashboard_overview (without user_has_workspace_access check)
CREATE OR REPLACE FUNCTION public.dashboard_overview(p_workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Basic access check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    SELECT json_build_object(
        'total_followers', COALESCE(SUM(ia.followers_count), 0),
        'total_posts', COALESCE(SUM(ia.posts_count), 0),
        'total_likes_last_30_days', 0, -- Will be calculated from post_performances if available
        'average_engagement_rate', COALESCE(AVG(ia.engagement_rate), 0),
        'accounts', (
            SELECT json_agg(
                json_build_object(
                    'id', ia.id,
                    'username', ia.username,
                    'profile_picture_url', ia.profile_picture_url,
                    'followers', ia.followers_count,
                    'posts', ia.posts_count,
                    'engagement_rate', ia.engagement_rate
                )
            )
            FROM public.instagram_accounts ia
            WHERE ia.workspace_id = p_workspace_id
        )
    ) INTO result
    FROM public.instagram_accounts ia
    WHERE ia.workspace_id = p_workspace_id;

    RETURN COALESCE(result, '{}'::json);
END;
$$;
```

## Quick Fix Script

Run this complete script in Supabase SQL Editor:

```sql
-- 1. Create helper function (if doesn't exist)
CREATE OR REPLACE FUNCTION public.user_has_workspace_access(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.workspace_users
        WHERE workspace_id = p_workspace_id
        AND user_id = v_user_id
    );
END;
$$;

-- 2. Create dashboard_overview function
CREATE OR REPLACE FUNCTION public.dashboard_overview(p_workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check workspace access
    IF NOT public.user_has_workspace_access(p_workspace_id) THEN
        RAISE EXCEPTION 'Access denied to workspace';
    END IF;

    SELECT json_build_object(
        'total_followers', COALESCE(SUM(ia.followers_count), 0),
        'total_posts', COALESCE(SUM(ia.posts_count), 0),
        'total_likes_last_30_days', 0,
        'average_engagement_rate', COALESCE(AVG(ia.engagement_rate), 0),
        'accounts', (
            SELECT json_agg(
                json_build_object(
                    'id', ia.id,
                    'username', ia.username,
                    'profile_picture_url', ia.profile_picture_url,
                    'followers', ia.followers_count,
                    'posts', ia.posts_count,
                    'engagement_rate', ia.engagement_rate
                )
            )
            FROM public.instagram_accounts ia
            WHERE ia.workspace_id = p_workspace_id
        )
    ) INTO result
    FROM public.instagram_accounts ia
    WHERE ia.workspace_id = p_workspace_id;

    RETURN COALESCE(result, '{}'::json);
END;
$$;
```

## Verify It Works

After running the script:

1. Check browser console - 404 error should be gone
2. Dashboard should load without errors
3. You can test the function directly:

```sql
-- Test the function (replace with your workspace ID)
SELECT public.dashboard_overview('your-workspace-id-here');
```

## Still Getting Errors?

1. **Check if function exists:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'dashboard_overview';
   ```

2. **Check for syntax errors:**
   - Look at the error message in SQL Editor
   - Common issues: missing tables, wrong column names

3. **Check workspace access:**
   - Make sure you're logged in
   - Make sure you have a workspace
   - Check `workspace_users` table has your user

