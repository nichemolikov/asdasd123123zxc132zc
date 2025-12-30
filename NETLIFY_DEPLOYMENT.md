# Deploy InstaCommand to Netlify

Complete guide to deploy your InstaCommand app to Netlify.

## Prerequisites

1. **GitHub/GitLab/Bitbucket account** (for Git integration)
2. **Netlify account** (free at https://netlify.com)
3. **Supabase project** (already set up)
4. **Facebook App** (for Instagram API - if using)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - InstaCommand app"
```

### 1.2 Push to GitHub/GitLab/Bitbucket

```bash
# Create a new repository on GitHub/GitLab/Bitbucket first
git remote add origin https://github.com/yourusername/instacommand.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign up or log in

2. **Add New Site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Netlify should auto-detect these from `netlify.toml`

4. **Set Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add these variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_FACEBOOK_APP_ID=your-facebook-app-id
   VITE_INSTAGRAM_REDIRECT_URI=https://your-site.netlify.app/auth/callback
   ```

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for build to complete (2-5 minutes)

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Follow prompts to link to existing site or create new one

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your-anon-key"
   netlify env:set VITE_FACEBOOK_APP_ID "your-facebook-app-id"
   netlify env:set VITE_INSTAGRAM_REDIRECT_URI "https://your-site.netlify.app/auth/callback"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Update Supabase Settings

### 3.1 Update Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Redirect URLs**:
   ```
   https://your-site.netlify.app
   https://your-site.netlify.app/auth/callback
   ```

### 3.2 Update Site URL

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://your-site.netlify.app`

## Step 4: Update Facebook App Settings

### 4.1 Update OAuth Redirect URIs

1. Go to **Facebook Developers** → Your App → **Settings** → **Basic**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   https://your-site.netlify.app/auth/callback
   ```

### 4.2 Update App Domains

1. In Facebook App → **Settings** → **Basic**
2. Add **App Domains**: `your-site.netlify.app`

## Step 5: Update Environment Variables

After deployment, update the redirect URI in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Update `VITE_INSTAGRAM_REDIRECT_URI` to your actual Netlify URL:
   ```
   https://your-site.netlify.app/auth/callback
   ```
3. **Redeploy** the site (trigger a new deploy)

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain in Netlify

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `instacommand.com`)
4. Follow DNS configuration instructions

### 6.2 Update Environment Variables

After adding custom domain, update:
- `VITE_INSTAGRAM_REDIRECT_URI` in Netlify
- Redirect URLs in Supabase
- OAuth Redirect URIs in Facebook App

## Step 7: Verify Deployment

### 7.1 Check Build Logs

1. Go to **Deploys** tab in Netlify
2. Click on latest deploy
3. Check for any build errors

### 7.2 Test Your App

1. Visit your Netlify URL
2. Test:
   - ✅ Landing page loads
   - ✅ Sign up / Login works
   - ✅ Dashboard loads
   - ✅ Instagram connection works (if configured)

## Troubleshooting

### Build Fails

**Error: "Command not found: npm"**
- Solution: Check Node version in `netlify.toml` (should be 18+)

**Error: "Module not found"**
- Solution: Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build directory not found"**
- Solution: Check `publish` directory in `netlify.toml` is `dist`

### App Not Loading

**White screen / Blank page**
- Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase connection

**404 on routes**
- Verify `_redirects` file exists in `public/` folder
- Check `netlify.toml` has redirect rules

**Authentication not working**
- Verify Supabase redirect URLs include Netlify URL
- Check environment variables are set correctly

### Environment Variables Not Working

**Variables not available in app**
- Make sure they start with `VITE_` prefix
- Redeploy after adding variables
- Check variable names match exactly

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Netlify automatically builds and deploys

## Build Optimization

### Enable Build Plugins (Optional)

1. Go to **Site settings** → **Build & deploy** → **Plugins**
2. Recommended plugins:
   - **Netlify Plugin Cache** - Cache node_modules
   - **Bundle Analyzer** - Analyze bundle size

### Performance Tips

1. **Enable Asset Optimization**
   - Site settings → **Build & deploy** → **Post processing**
   - Enable **Asset optimization**

2. **Enable Form Handling** (if using Netlify Forms)
   - Add `netlify` attribute to forms

## Security Headers

Already configured in `netlify.toml`:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Monitoring

### Netlify Analytics (Optional)

1. Go to **Site settings** → **Analytics**
2. Enable **Netlify Analytics** (paid feature)
3. Or use **Google Analytics** (free)

### Error Tracking

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay

## Quick Reference

### Netlify URLs

- **Dashboard**: https://app.netlify.com
- **Site URL**: `https://your-site.netlify.app`
- **Deploy logs**: Site → Deploys → Click deploy

### Important Files

- `netlify.toml` - Build configuration
- `public/_redirects` - SPA routing
- `.env` - Local environment variables (not deployed)

### Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_FACEBOOK_APP_ID` (if using Instagram API)
- [ ] `VITE_INSTAGRAM_REDIRECT_URI` (must match Netlify URL)

## Next Steps

After deployment:

1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Configure analytics
4. ✅ Set up error tracking
5. ✅ Update documentation with production URL

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Status Page**: https://www.netlifystatus.com

