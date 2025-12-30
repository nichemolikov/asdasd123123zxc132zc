# Netlify Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to Git
- [ ] `netlify.toml` file created
- [ ] `public/_redirects` file created
- [ ] `.env.example` file created (for reference)
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] Build works locally: `npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors

### Configuration Files
- [ ] `netlify.toml` has correct build settings
- [ ] `package.json` has build script
- [ ] `index.html` has correct title and meta tags
- [ ] All environment variables documented

## Deployment Steps

### 1. Git Repository
- [ ] Repository created on GitHub/GitLab/Bitbucket
- [ ] Code pushed to repository
- [ ] Main branch is set correctly

### 2. Netlify Setup
- [ ] Netlify account created
- [ ] Site created and linked to Git repository
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Node version set (18+)

### 3. Environment Variables in Netlify
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set
- [ ] `VITE_FACEBOOK_APP_ID` set (if using Instagram API)
- [ ] `VITE_INSTAGRAM_REDIRECT_URI` set to Netlify URL

### 4. Supabase Configuration
- [ ] Redirect URLs updated:
  - `https://your-site.netlify.app`
  - `https://your-site.netlify.app/auth/callback`
- [ ] Site URL updated to Netlify URL
- [ ] RLS policies enabled
- [ ] Database migrations run

### 5. Facebook App Configuration (If using Instagram API)
- [ ] OAuth Redirect URIs updated:
  - `https://your-site.netlify.app/auth/callback`
- [ ] App Domains added:
  - `your-site.netlify.app`
- [ ] Permissions requested and approved

## Post-Deployment Verification

### Build Verification
- [ ] Build completed successfully
- [ ] No build errors in Netlify logs
- [ ] Site is live and accessible

### Functionality Tests
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Navigation works (all routes)
- [ ] Instagram connection works (if configured)
- [ ] Supabase connection works
- [ ] No console errors

### Security Checks
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Environment variables not exposed in frontend
- [ ] API keys are public keys only (not secrets)
- [ ] Security headers configured

### Performance Checks
- [ ] Page loads quickly
- [ ] Assets are optimized
- [ ] Images are optimized
- [ ] No unnecessary requests

## Post-Deployment Updates

### After Getting Netlify URL
- [ ] Update `VITE_INSTAGRAM_REDIRECT_URI` in Netlify
- [ ] Update Supabase redirect URLs
- [ ] Update Facebook App redirect URIs
- [ ] Redeploy site

### Custom Domain (Optional)
- [ ] Custom domain added in Netlify
- [ ] DNS configured correctly
- [ ] SSL certificate issued
- [ ] Updated all redirect URLs to custom domain
- [ ] Redeployed site

## Monitoring Setup

### Analytics (Optional)
- [ ] Netlify Analytics enabled (or Google Analytics)
- [ ] Error tracking set up (Sentry, etc.)

### Alerts
- [ ] Build failure notifications enabled
- [ ] Deployment notifications configured

## Documentation

- [ ] Deployment guide created (`NETLIFY_DEPLOYMENT.md`)
- [ ] Environment variables documented
- [ ] Team members have access
- [ ] Deployment process documented

## Quick Test Commands

```bash
# Test build locally
npm run build

# Test preview
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

## Common Issues & Solutions

### Build Fails
- Check Node version (should be 18+)
- Check all dependencies are in package.json
- Check for TypeScript errors
- Check build logs in Netlify

### App Not Loading
- Check environment variables are set
- Check Supabase connection
- Check browser console for errors
- Verify redirect URLs are correct

### Routes Return 404
- Check `_redirects` file exists
- Check `netlify.toml` has redirect rules
- Verify SPA routing is configured

### Authentication Not Working
- Check Supabase redirect URLs
- Check environment variables
- Verify OAuth redirect URIs match

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Status**: https://www.netlifystatus.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

## Notes

- Environment variables starting with `VITE_` are exposed to frontend
- Never commit `.env` files with secrets
- Always test build locally before deploying
- Keep `netlify.toml` and `_redirects` in version control

