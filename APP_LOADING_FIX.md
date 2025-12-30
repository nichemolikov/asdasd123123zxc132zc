# App Not Loading - Troubleshooting Guide

## Quick Fixes

### 1. Check Browser Console
Open DevTools (F12) and check for errors:
- Red errors in Console tab
- Network errors in Network tab
- React errors

### 2. Common Issues & Solutions

#### ❌ "Cannot find module" or Import Errors
**Solution:**
```bash
# Stop server (Ctrl+C)
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### ❌ "Supabase client not initialized"
**Check:**
1. `.env` file exists in project root
2. Contains:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
3. Restart dev server after adding `.env`

#### ❌ "RPC function not found"
**Solution:**
- Run RPC functions migration in Supabase SQL Editor
- File: `supabase/migrations/20250101000001_rpc_functions.sql`

#### ❌ "Table does not exist"
**Solution:**
- Run database migration in Supabase SQL Editor
- File: `supabase/migrations/20250101000000_workspace_multi_tenant.sql`

#### ❌ White Screen / Blank Page
**Check:**
1. Browser console for React errors
2. Network tab for failed requests
3. Check if `index.html` has `<div id="root"></div>`

#### ❌ Infinite Loading
**Possible causes:**
- WorkspaceProvider waiting for workspace that doesn't exist
- RPC function `current_workspace()` failing
- User not authenticated but trying to access protected route

**Solution:**
- Check if user is logged in
- If new user, sign up first (creates workspace automatically)
- Check browser console for specific error

### 3. Step-by-Step Debug

1. **Check if app starts:**
   ```bash
   npm run dev
   ```
   Should show: `Local: http://localhost:8080`

2. **Open browser console (F12)**
   - Look for errors
   - Check if Supabase client initialized

3. **Test connection:**
   - Go to `/settings` → Connection tab
   - Click "Test Connection"
   - Review results

4. **Check authentication:**
   - Try going to `/auth`
   - Try signing up
   - Check if redirects work

5. **Check workspace:**
   - After signup/login, check browser console
   - Should see workspace data loading
   - If errors, check RPC function exists

### 4. Manual Verification

Run in browser console (F12):
```javascript
// Check Supabase connection
import { supabase } from '@/integrations/supabase/client';
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing');

// Test auth
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? 'Logged in' : 'Not logged in');

// Test database
const { data, error } = await supabase.from('users').select('count').limit(0);
console.log('Database:', error ? error.message : 'Connected');
```

### 5. Reset Everything

If nothing works:

1. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Check Supabase:**
   - Verify tables exist (run diagnostic query)
   - Verify RPC functions exist
   - Regenerate TypeScript types

### 6. Get Specific Error

If app still doesn't load:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy the exact error message
4. Share it for further debugging

## Most Common Fix

**90% of issues are:**
1. Missing `.env` file → Create it with Supabase credentials
2. Dev server not restarted → Stop and restart `npm run dev`
3. Migrations not run → Run SQL migrations in Supabase Dashboard

