# Quick Fix Checklist - App Not Loading

## ✅ Step-by-Step Fix

### 1. Check Browser Console (F12)
- [ ] Open DevTools → Console tab
- [ ] Look for red errors
- [ ] Copy any error messages

### 2. Check Environment Variables
- [ ] `.env` file exists in project root
- [ ] Contains `VITE_SUPABASE_URL`
- [ ] Contains `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] No quotes around values
- [ ] Restart dev server after changes

### 3. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4. Check Supabase Connection
- [ ] Go to `/settings` → Connection tab
- [ ] Click "Test Connection"
- [ ] All should show ✅

### 5. Verify Database Tables
Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'workspaces', 'instagram_accounts');
```

### 6. Check RPC Functions
Run in Supabase SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'current_workspace';
```

### 7. Clear Browser Cache
- [ ] Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- [ ] Or clear browser cache completely

### 8. Check Network Tab
- [ ] Open DevTools → Network tab
- [ ] Refresh page
- [ ] Look for failed requests (red)
- [ ] Check if Supabase requests are failing

## Common Error Messages & Fixes

### "Cannot find module"
**Fix:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Supabase client not initialized"
**Fix:** Check `.env` file and restart server

### "RPC function does not exist"
**Fix:** Run `supabase/migrations/20250101000001_rpc_functions.sql`

### "Table does not exist"
**Fix:** Run `supabase/migrations/20250101000000_workspace_multi_tenant.sql`

### White screen / Blank page
**Fix:** 
1. Check browser console for React errors
2. Check if root element exists in `index.html`
3. Check for JavaScript errors

### Infinite loading spinner
**Fix:**
- WorkspaceProvider might be waiting for RPC function
- Check if `current_workspace` RPC exists
- Check browser console for errors

## Still Not Working?

1. **Share the exact error message** from browser console
2. **Share what you see:**
   - White screen?
   - Loading spinner?
   - Error page?
   - Nothing at all?

3. **Check these files exist:**
   - `src/main.tsx`
   - `src/App.tsx`
   - `index.html`
   - `.env`

4. **Run diagnostic:**
   - Open browser console
   - Should see "🔍 App Diagnostics" message
   - Share the output

