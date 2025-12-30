# Instagram API Quick Start

## 🚀 Fast Setup (5 Minutes)

### 1. Create Facebook App

1. Go to: https://developers.facebook.com/apps/
2. Click **"Create App"** → **"Business"**
3. App Name: `InstaCommand`
4. Click **"Create App"**

### 2. Add Instagram Product

1. In app dashboard → **"Add Products"**
2. Find **"Instagram"** → **"Set Up"**
3. Select **"Instagram Graph API"**

### 3. Get Your Credentials

Go to **Settings → Basic**:
- Copy **App ID**
- Copy **App Secret** (click "Show")

### 4. Configure Redirect URI

Go to **Products → Instagram → Basic Display**:

Add these redirect URIs:
```
http://localhost:8080/auth/callback
https://your-production-domain.com/auth/callback
```

### 5. Add to Environment Variables

Create/update `.env`:

```env
# Facebook/Instagram API
VITE_FACEBOOK_APP_ID=your-app-id-here
VITE_FACEBOOK_APP_SECRET=your-app-secret-here
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:8080/auth/callback
```

### 6. Convert Instagram to Business Account

1. Open Instagram app
2. **Settings → Account → Switch to Professional Account**
3. Choose **"Business"**
4. Connect to Facebook Page (create one if needed)

### 7. Test Connection

1. Restart dev server: `npm run dev`
2. Go to Accounts page
3. Click "Connect Instagram"
4. Authorize with Facebook
5. Grant permissions
6. Should connect successfully!

## 📋 Required Permissions

Request these in Facebook App:
- `instagram_basic` - Basic profile
- `instagram_manage_insights` - Analytics
- `instagram_content_publish` - Post content
- `pages_read_engagement` - Read engagement
- `pages_show_list` - List pages

## ⚠️ Important Notes

1. **App Secret** must NEVER be in frontend code
2. Use **Edge Functions** for server-side API calls
3. **HTTPS required** for production OAuth
4. Some permissions need **App Review** for production

## 🔗 Useful Links

- **Meta Developers**: https://developers.facebook.com/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Instagram Graph API Docs**: https://developers.facebook.com/docs/instagram-api/
- **App Dashboard**: https://developers.facebook.com/apps/

## 🐛 Common Issues

### "Invalid Redirect URI"
- Must match exactly in Facebook App settings
- Include protocol (http:// or https://)
- No trailing slashes

### "User hasn't authorized"
- User must grant all permissions
- Some permissions require App Review

### "No Business Account"
- Must convert Instagram to Business/Creator
- Must connect to Facebook Page

## ✅ Verification

After setup, verify:

1. **App ID and Secret** in `.env`
2. **Redirect URI** configured in Facebook App
3. **Instagram is Business account**
4. **Connected to Facebook Page**
5. **Edge Functions deployed** (for production)

Then test the connection flow!

