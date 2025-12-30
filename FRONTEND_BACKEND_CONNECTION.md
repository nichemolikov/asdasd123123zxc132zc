# Frontend-Backend Connection Guide

This guide explains how the frontend connects to the Supabase backend.

## Overview

The frontend uses:
- **Supabase Client** - For authentication and database queries
- **Workspace Context** - Manages current workspace and subscription
- **Custom Hooks** - Fetch and manage data with workspace isolation
- **RPC Functions** - Server-side functions for complex operations

## Setup Steps

### 1. Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 2. Run Database Migrations

Before using the frontend, run the Supabase migrations:

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/20250101000000_workspace_multi_tenant.sql`
3. Run `supabase/migrations/20250101000001_rpc_functions.sql`

### 3. Deploy Edge Functions

```bash
supabase functions deploy process_scheduled_posts
supabase functions deploy daily_analytics_snapshot
```

## How It Works

### Authentication Flow

1. **User Signs Up** (`src/pages/Auth.tsx`):
   ```typescript
   // After Supabase Auth signup
   await supabase.rpc("signup_bootstrap", {
     workspace_name: "My Workspace"
   });
   ```
   - Creates user record in `public.users`
   - Creates workspace
   - Adds user as Owner
   - Creates Free plan subscription

2. **User Logs In**:
   - Standard Supabase Auth login
   - WorkspaceProvider automatically fetches workspace data

### Workspace Management

**WorkspaceProvider** (`src/hooks/useWorkspace.tsx`):
- Automatically loads workspace when user is authenticated
- Provides `workspace` and `subscription` to all components
- Calls `current_workspace()` RPC function

**Usage:**
```typescript
import { useWorkspace } from "@/hooks/useWorkspace";

const { workspace, subscription, loading } = useWorkspace();
```

### Data Fetching

All data fetching is workspace-scoped:

#### Instagram Accounts (`src/hooks/useInstagramAccounts.tsx`)

```typescript
// Automatically filters by workspace_id
const { accounts, addAccount } = useInstagramAccounts();

// Adding account requires workspace
await addAccount("username");
// Inserts with workspace_id from context
```

**Backend Query:**
```sql
SELECT * FROM instagram_accounts 
WHERE workspace_id = current_workspace_id
```

#### Scheduled Posts (`src/hooks/useScheduledPosts.tsx`)

```typescript
const { scheduledPosts, createScheduledPost } = useScheduledPosts();

await createScheduledPost({
  account_id: "...",
  caption: "...",
  scheduled_for: "..."
});
// Automatically includes workspace_id
```

**Backend Query:**
```sql
SELECT * FROM scheduled_posts 
WHERE workspace_id = current_workspace_id
AND status = 'scheduled'
```

#### Analytics (`src/hooks/useAnalytics.tsx`)

Uses `dashboard_overview` RPC function:

```typescript
const { stats, chartData } = useAnalytics(accounts);

// Internally calls:
await supabase.rpc("dashboard_overview", {
  p_workspace_id: workspace.id
});
```

**Returns:**
- Total followers, posts, likes
- Average engagement rate
- Account list with engagement scores

## RPC Functions Used

### 1. `signup_bootstrap(workspace_name)`
**Called:** After user signup  
**Location:** `src/pages/Auth.tsx`

```typescript
await supabase.rpc("signup_bootstrap", {
  workspace_name: "My Workspace"
});
```

### 2. `current_workspace()`
**Called:** Automatically by WorkspaceProvider  
**Location:** `src/hooks/useWorkspace.tsx`

```typescript
const { data } = await supabase.rpc("current_workspace");
// Returns: { workspace, subscription }
```

### 3. `dashboard_overview(p_workspace_id)`
**Called:** By useAnalytics hook  
**Location:** `src/hooks/useAnalytics.tsx`

```typescript
const { data } = await supabase.rpc("dashboard_overview", {
  p_workspace_id: workspace.id
});
```

### 4. `get_instagram_account_details(p_account_id)`
**Can be used for:** Account detail pages

```typescript
const { data } = await supabase.rpc("get_instagram_account_details", {
  p_account_id: accountId
});
```

### 5. `invite_member(p_workspace_id, p_email, p_role)`
**Can be used for:** Team management in Settings

```typescript
await supabase.rpc("invite_member", {
  p_workspace_id: workspace.id,
  p_email: "member@example.com",
  p_role: "Member"
});
```

## REST API Usage

All tables are automatically exposed via REST API with RLS protection:

### Get Workspaces
```typescript
const { data } = await supabase
  .from("workspaces")
  .select("*");
// RLS automatically filters to user's workspaces
```

### Get Instagram Accounts
```typescript
const { data } = await supabase
  .from("instagram_accounts")
  .select("*")
  .eq("workspace_id", workspace.id);
```

### Get Scheduled Posts
```typescript
const { data } = await supabase
  .from("scheduled_posts")
  .select(`
    *,
    instagram_accounts (
      username,
      profile_picture_url
    )
  `)
  .eq("workspace_id", workspace.id)
  .eq("status", "scheduled");
```

### Get Alerts
```typescript
const { data } = await supabase
  .from("alerts")
  .select("*")
  .eq("workspace_id", workspace.id)
  .eq("is_read", false)
  .order("created_at", { ascending: false });
```

### Update Alert (Mark as Read)
```typescript
await supabase
  .from("alerts")
  .update({ is_read: true })
  .eq("id", alertId);
```

## Component Updates

### Updated Components

1. **App.tsx** - Added `WorkspaceProvider`
2. **Auth.tsx** - Calls `signup_bootstrap` after signup
3. **useInstagramAccounts** - Uses `workspace_id` instead of `user_id`
4. **useScheduledPosts** - Uses `workspace_id` and new schema
5. **useAnalytics** - Optionally uses `dashboard_overview` RPC

### New Components

1. **useWorkspace** - Workspace context provider
2. **WorkspaceProvider** - Wraps app to provide workspace data

## Data Flow

```
User Signs Up
    ↓
Supabase Auth creates auth.users record
    ↓
Auth.tsx calls signup_bootstrap()
    ↓
Creates: users, workspace, workspace_users, subscription
    ↓
User logs in
    ↓
WorkspaceProvider calls current_workspace()
    ↓
Components use hooks (useInstagramAccounts, etc.)
    ↓
Hooks filter by workspace_id (via RLS or explicit filter)
    ↓
Data displayed in UI
```

## Security

All data is protected by **Row Level Security (RLS)**:

- Users can only see data for workspaces they belong to
- RLS policies use `user_has_workspace_access()` function
- Frontend filters by `workspace_id` for additional safety
- All RPC functions check workspace access

## Testing the Connection

1. **Sign Up a New User:**
   - Go to `/auth`
   - Sign up with email/password
   - Check Supabase Dashboard → `users` table
   - Verify workspace was created

2. **Check Workspace:**
   ```typescript
   const { workspace } = useWorkspace();
   console.log(workspace); // Should show workspace data
   ```

3. **Add Instagram Account:**
   - Go to Accounts page
   - Click "Connect Account"
   - Verify account appears in `instagram_accounts` table with `workspace_id`

4. **Schedule a Post:**
   - Go to Scheduler page
   - Create scheduled post
   - Verify in `scheduled_posts` table with `workspace_id`

## Troubleshooting

### "Access denied to workspace"
- User might not have workspace yet
- Call `signup_bootstrap()` after signup
- Check `workspace_users` table for user membership

### "No workspace found"
- User needs to sign up first (not just login)
- Or manually create workspace via SQL

### Data not showing
- Check RLS policies are enabled
- Verify `workspace_id` is set correctly
- Check browser console for errors
- Verify Supabase connection in `.env`

### RPC function errors
- Check function exists in Supabase Dashboard
- Verify function permissions
- Check function logs in Supabase Dashboard

## Next Steps

1. **Update Alerts Page** - Connect to `alerts` table
2. **Update Settings Page** - Use workspace/subscription data
3. **Add Team Management** - Use `invite_member` RPC
4. **Add Account Details** - Use `get_instagram_account_details` RPC
5. **Real Instagram API** - Replace simulated data with real API calls

