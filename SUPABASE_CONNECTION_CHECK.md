# Supabase Connection Check Guide

## Quick Check

I've created tools to help you verify your Supabase connection:

### 1. Connection Test Component

Go to **Settings → Connection** tab in your app to run an automated connection test.

The test checks:
- ✅ Environment variables are set
- ✅ Database connection works
- ✅ Authentication service is available
- ✅ Database tables are accessible
- ✅ RPC functions are available

### 2. Manual Check

#### Check Environment Variables

Your `.env` file should contain:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

**To get these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

#### Verify Connection in Browser Console

Open browser DevTools (F12) and run:

```javascript
// Check if Supabase client is initialized
import { supabase } from '@/integrations/supabase/client';
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing');

// Test connection
const { data, error } = await supabase.from('users').select('count').limit(0);
console.log('Connection test:', error ? error.message : 'Success');
```

### 3. Common Issues

#### ❌ "Missing environment variables"
**Solution:** 
- Create `.env` file in project root
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart dev server (`npm run dev`)

#### ❌ "Connection error: Invalid API key"
**Solution:**
- Verify you're using the **anon public** key (not service role key)
- Check for typos in `.env` file
- Make sure there are no quotes around values

#### ❌ "Table does not exist"
**Solution:**
- Run database migrations in Supabase SQL Editor
- Run: `supabase/migrations/20250101000000_workspace_multi_tenant.sql`
- Run: `supabase/migrations/20250101000001_rpc_functions.sql`

#### ❌ "RPC functions not found"
**Solution:**
- Run RPC functions migration
- Check Supabase Dashboard → Database → Functions

#### ❌ "Access denied" or RLS errors
**Solution:**
- Verify RLS policies are enabled
- Check user is authenticated
- Verify workspace is created (call `signup_bootstrap` after signup)

### 4. Test Checklist

- [ ] `.env` file exists with correct values
- [ ] Dev server restarted after adding `.env`
- [ ] Database migrations run successfully
- [ ] RPC functions created
- [ ] Connection test shows all green checkmarks
- [ ] Can sign up/login
- [ ] Can fetch workspace data
- [ ] Can add Instagram account

### 5. Next Steps After Connection Verified

1. **Test Signup Flow:**
   - Sign up a new user
   - Verify workspace is created automatically
   - Check `users`, `workspaces`, `subscriptions` tables

2. **Test Data Operations:**
   - Add an Instagram account
   - Schedule a post
   - Check alerts appear

3. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy process_scheduled_posts
   supabase functions deploy daily_analytics_snapshot
   ```

## Need Help?

If connection test fails:
1. Check browser console for detailed errors
2. Check Supabase Dashboard → Logs
3. Verify project is active (not paused)
4. Check network tab for API requests

