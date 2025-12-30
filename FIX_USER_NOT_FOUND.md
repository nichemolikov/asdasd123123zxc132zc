# Fix: "User not found" Error

## Problem

When logging in, you see: **"Error loading workspace - User not found"**

This happens because:
- User exists in `auth.users` (Supabase Auth)
- But user doesn't exist in `public.users` (application table)
- This can happen if:
  - User signed up before `signup_bootstrap` was implemented
  - `signup_bootstrap` failed silently during signup
  - User was created manually in Supabase Auth

## ✅ Automatic Fix Applied

I've updated `useWorkspace` hook to automatically:
1. Detect when user is not found
2. Call `signup_bootstrap()` to create the user and workspace
3. Retry loading the workspace

**The fix is already in place!** Just refresh the page or log out and log back in.

## Manual Fix (If Needed)

### Option 1: Run Bootstrap for Existing User

Run this in **Supabase Dashboard → SQL Editor**:

```sql
-- Replace 'USER_EMAIL_HERE' with your actual email
-- This will create the user and workspace for an existing auth user

DO $$
DECLARE
    v_auth_user_id UUID;
    v_user_id UUID;
    v_workspace_id UUID;
    v_free_plan_id UUID;
BEGIN
    -- Get auth user ID from email
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = 'USER_EMAIL_HERE'
    LIMIT 1;

    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email not found in auth.users';
    END IF;

    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = v_auth_user_id;

    -- Create user if doesn't exist
    IF v_user_id IS NULL THEN
        INSERT INTO public.users (auth_user_id, name)
        VALUES (v_auth_user_id, COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_auth_user_id),
            'User'
        ))
        RETURNING id INTO v_user_id;
        
        RAISE NOTICE 'Created user: %', v_user_id;
    END IF;

    -- Check if workspace exists
    SELECT w.id INTO v_workspace_id
    FROM public.workspaces w
    JOIN public.workspace_users wu ON wu.workspace_id = w.id
    WHERE wu.user_id = v_user_id
    LIMIT 1;

    -- Create workspace if doesn't exist
    IF v_workspace_id IS NULL THEN
        INSERT INTO public.workspaces (name, owner_user_id)
        VALUES ('My Workspace', v_user_id)
        RETURNING id INTO v_workspace_id;
        
        -- Add user as Owner
        INSERT INTO public.workspace_users (workspace_id, user_id, role)
        VALUES (v_workspace_id, v_user_id, 'Owner');
        
        -- Get Free plan
        SELECT id INTO v_free_plan_id
        FROM public.subscription_plans
        WHERE name = 'Free'
        LIMIT 1;

        -- Create subscription
        IF v_free_plan_id IS NOT NULL THEN
            INSERT INTO public.subscriptions (
                workspace_id,
                subscription_plan_id,
                status,
                trial_ends_at,
                current_period_end
            )
            VALUES (
                v_workspace_id,
                v_free_plan_id,
                'trialing',
                now() + INTERVAL '14 days',
                now() + INTERVAL '14 days'
            );
        END IF;
        
        RAISE NOTICE 'Created workspace: %', v_workspace_id;
    END IF;

    RAISE NOTICE 'Setup complete for user: %', v_auth_user_id;
END $$;
```

**To use:**
1. Replace `'USER_EMAIL_HERE'` with your actual email
2. Run the query
3. Refresh your app

### Option 2: Use RPC Function (If Authenticated)

If you're logged in, you can call the RPC function directly:

1. Open browser console (F12)
2. Run:
```javascript
const { data, error } = await supabase.rpc('signup_bootstrap', {
  workspace_name: 'My Workspace'
});
console.log(data, error);
```

### Option 3: Sign Up Again

1. Log out
2. Sign up with a new email (or delete your account and sign up again)
3. The `signup_bootstrap` will run automatically

## Verify Fix

After applying the fix:

1. **Check user exists:**
   ```sql
   SELECT * FROM public.users WHERE auth_user_id = (
       SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

2. **Check workspace exists:**
   ```sql
   SELECT w.*, wu.role 
   FROM public.workspaces w
   JOIN public.workspace_users wu ON wu.workspace_id = w.id
   JOIN public.users u ON u.id = wu.user_id
   WHERE u.auth_user_id = (
       SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

3. **Refresh app** - Error should be gone!

## Prevention

The updated code now automatically calls `signup_bootstrap` if:
- User is authenticated but not in `public.users`
- Workspace doesn't exist for the user

This should prevent the error from happening again.

