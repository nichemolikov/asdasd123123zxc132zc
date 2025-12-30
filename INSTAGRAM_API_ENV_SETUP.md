# Instagram API Environment Variables Setup

## Required Environment Variables

### Frontend (.env file)

Add these to your `.env` file in the project root:

```env
# Facebook/Instagram Graph API
VITE_FACEBOOK_APP_ID=your-facebook-app-id-here
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:8080/auth/callback
```

**Note:** `VITE_FACEBOOK_APP_SECRET` should NEVER be in the frontend `.env` file. It's only used in Edge Functions.

### Supabase Edge Functions (Secrets)

Set these in Supabase Dashboard or via CLI:

**Via Supabase Dashboard:**
1. Go to **Project Settings → Edge Functions → Secrets**
2. Add each secret:
   - `FACEBOOK_APP_ID` = your Facebook App ID
   - `FACEBOOK_APP_SECRET` = your Facebook App Secret (keep this secret!)
   - `INSTAGRAM_REDIRECT_URI` = `https://your-domain.com/auth/callback` (or `http://localhost:8080/auth/callback` for dev)

**Via Supabase CLI:**
```bash
supabase secrets set FACEBOOK_APP_ID=your-app-id
supabase secrets set FACEBOOK_APP_SECRET=your-app-secret
supabase secrets set INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/callback
```

## Getting Your Credentials

### 1. Facebook App ID and Secret

1. Go to: https://developers.facebook.com/apps/
2. Select your app (or create one)
3. Go to **Settings → Basic**
4. Copy:
   - **App ID** → `VITE_FACEBOOK_APP_ID` and `FACEBOOK_APP_ID`
   - **App Secret** → `FACEBOOK_APP_SECRET` (only in Supabase secrets, NOT in frontend!)

### 2. Redirect URI

Use these formats:
- **Development**: `http://localhost:8080/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

Make sure these match exactly in:
- Facebook App settings (OAuth Redirect URIs)
- `.env` file (`VITE_INSTAGRAM_REDIRECT_URI`)
- Supabase secrets (`INSTAGRAM_REDIRECT_URI`)

## Example .env File

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Facebook/Instagram API
VITE_FACEBOOK_APP_ID=1234567890123456
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:8080/auth/callback
```

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env` file** to Git
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **App Secret is sensitive**
   - Only use in Edge Functions (server-side)
   - Never expose in frontend code
   - Never commit to version control

3. **Use different credentials for dev/prod**
   - Development: Test app with test users
   - Production: Production app with real users

4. **Rotate secrets if exposed**
   - If secret is leaked, regenerate in Facebook App settings
   - Update all places where it's used

## Verification

After setting up, verify:

1. **Frontend can read App ID:**
   ```javascript
   console.log('App ID:', import.meta.env.VITE_FACEBOOK_APP_ID);
   ```

2. **Edge Function can read secrets:**
   - Deploy Edge Function
   - Check logs for errors
   - Test OAuth flow

3. **Redirect URI matches:**
   - Check Facebook App settings
   - Check `.env` file
   - Check Supabase secrets

## Troubleshooting

### "VITE_FACEBOOK_APP_ID is not set"
- Check `.env` file exists in project root
- Check variable name is correct (starts with `VITE_`)
- Restart dev server after adding `.env`

### "Instagram API credentials not configured"
- Check Supabase secrets are set
- Verify secret names match exactly
- Redeploy Edge Function after setting secrets

### "Invalid Redirect URI"
- Must match exactly in Facebook App settings
- Include protocol (`http://` or `https://`)
- No trailing slashes
- Check both dev and prod URLs are added

## Next Steps

After setting environment variables:

1. Run database migration: `20250101000003_instagram_api_fields.sql`
2. Deploy Edge Function: `supabase functions deploy instagram-oauth`
3. Test OAuth flow in your app
4. Check browser console for any errors

