# Instagram API Setup Guide

Complete guide to configure Instagram Graph API for InstaCommand.

## Overview

Instagram uses the **Instagram Graph API** (part of Meta's Graph API) which requires:
- Facebook App
- Instagram Business or Creator Account
- OAuth 2.0 authentication
- Access tokens with proper permissions

## Prerequisites

1. **Facebook Business Account** (free)
2. **Instagram Business or Creator Account** (convert from personal)
3. **Facebook Page** (linked to Instagram account)
4. **Meta Developer Account** (free)

## Step 1: Create Facebook App

### 1.1 Go to Meta for Developers

1. Visit: https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as app type
4. Fill in:
   - **App Name**: InstaCommand (or your app name)
   - **App Contact Email**: your email
   - **Business Account**: Select or create one
5. Click **"Create App"**

### 1.2 Add Instagram Basic Display Product

1. In your app dashboard, go to **"Add Products"**
2. Find **"Instagram"** → Click **"Set Up"**
3. Select **"Instagram Graph API"** (for Business/Creator accounts)
4. Click **"Set Up"**

### 1.3 Configure Basic Settings

Go to **Settings → Basic**:

- **App ID**: Copy this (you'll need it)
- **App Secret**: Click "Show" and copy (keep it secret!)
- **Add Platform**: Add **"Website"**
  - Site URL: `https://your-domain.com` (or `http://localhost:8080` for dev)
- **Privacy Policy URL**: Required (can use a placeholder for now)
- **Terms of Service URL**: Optional
- **User Data Deletion**: Optional

## Step 2: Configure Instagram Product

### 2.1 Instagram Graph API Settings

1. Go to **Products → Instagram → Basic Display**
2. Click **"Create New App"** or use existing
3. Configure:
   - **Valid OAuth Redirect URIs**: 
     ```
     https://your-domain.com/auth/callback
     http://localhost:8080/auth/callback
     ```
   - **Deauthorize Callback URL**: 
     ```
     https://your-domain.com/auth/deauthorize
     ```
   - **Data Deletion Request URL**: Optional

### 2.2 Add Permissions (Scopes)

Go to **App Review → Permissions and Features**:

Request these permissions:
- `instagram_basic` - Basic profile info
- `instagram_manage_insights` - Analytics data
- `instagram_content_publish` - Post to Instagram
- `pages_read_engagement` - Read page engagement
- `pages_show_list` - List user's pages

**Note:** Some permissions require App Review for production use.

## Step 3: Get Instagram Business Account ID

### 3.1 Convert to Business Account

1. Open Instagram app
2. Go to **Settings → Account → Switch to Professional Account**
3. Choose **"Business"** or **"Creator"**
4. Connect to your Facebook Page
5. Complete setup

### 3.2 Get Instagram Account ID

**Method 1: Using Graph API Explorer**

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app
3. Get User Access Token (temporary)
4. Query: `me/accounts` to get pages
5. Query: `{page-id}?fields=instagram_business_account` to get Instagram ID

**Method 2: Using Access Token**

```bash
# Get your page ID first
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"

# Then get Instagram account ID
curl "https://graph.facebook.com/v18.0/{page-id}?fields=instagram_business_account&access_token=YOUR_TOKEN"
```

## Step 4: OAuth Flow Setup

### 4.1 Authorization URL

The OAuth flow starts with this URL:

```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id={app-id}
  &redirect_uri={redirect-uri}
  &scope=instagram_basic,instagram_manage_insights,instagram_content_publish,pages_read_engagement,pages_show_list
  &response_type=code
  &state={random-state}
```

### 4.2 Exchange Code for Token

After user authorizes, exchange the code:

```
POST https://graph.facebook.com/v18.0/oauth/access_token
  client_id={app-id}
  &client_secret={app-secret}
  &redirect_uri={redirect-uri}
  &code={authorization-code}
```

### 4.3 Exchange Short-Lived Token for Long-Lived Token

Short-lived tokens expire in 1 hour. Exchange for long-lived (60 days):

```
GET https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token
  &client_id={app-id}
  &client_secret={app-secret}
  &fb_exchange_token={short-lived-token}
```

### 4.4 Get Page Access Token

For Instagram API, you need a Page Access Token:

```
GET https://graph.facebook.com/v18.0/{page-id}?
  fields=access_token
  &access_token={user-access-token}
```

## Step 5: Environment Variables

Add to your `.env` file:

```env
# Instagram/Facebook API
VITE_FACEBOOK_APP_ID=your-app-id
VITE_FACEBOOK_APP_SECRET=your-app-secret
VITE_INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/callback

# For server-side (Edge Functions)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/callback
```

**⚠️ Security Note:** Never expose `APP_SECRET` in frontend code! Only use it in Edge Functions or server-side code.

## Step 6: Update Supabase Schema

Add Instagram API fields to your database:

```sql
-- Add Instagram API fields to instagram_accounts table
ALTER TABLE public.instagram_accounts
  ADD COLUMN IF NOT EXISTS instagram_account_id TEXT, -- Instagram Business Account ID
  ADD COLUMN IF NOT EXISTS facebook_page_id TEXT, -- Connected Facebook Page ID
  ADD COLUMN IF NOT EXISTS access_token TEXT, -- Long-lived access token
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ, -- Token expiration
  ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'LONG_LIVED'; -- Token type
```

## Step 7: Create Edge Function for Instagram OAuth

Create: `supabase/functions/instagram-oauth/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, state, workspace_id } = await req.json();
    
    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");
    const redirectUri = Deno.env.get("INSTAGRAM_REDIRECT_URI");

    if (!appId || !appSecret || !redirectUri) {
      throw new Error("Instagram API credentials not configured");
    }

    // 1. Exchange code for short-lived token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${shortLivedToken}`
    );

    const longLivedData = await longLivedResponse.json();
    if (longLivedData.error) {
      throw new Error(longLivedData.error.message);
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // seconds

    // 3. Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error || !pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook pages found. Please connect a page to your Instagram account.");
    }

    // 4. Get Instagram Business Account for first page
    const page = pagesData.data[0];
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?` +
      `fields=instagram_business_account&access_token=${longLivedToken}`
    );
    const instagramData = await instagramResponse.json();

    if (instagramData.error || !instagramData.instagram_business_account) {
      throw new Error("No Instagram Business Account found. Please convert your Instagram to Business account.");
    }

    const instagramAccount = instagramData.instagram_business_account;

    // 5. Get page access token (needed for Instagram API)
    const pageTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?` +
      `fields=access_token&access_token=${longLivedToken}`
    );
    const pageTokenData = await pageTokenResponse.json();

    // 6. Get Instagram account info
    const accountInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccount.id}?` +
      `fields=username,profile_picture_url&access_token=${pageTokenData.access_token}`
    );
    const accountInfo = await accountInfoResponse.json();

    // 7. Save to database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    const { error: dbError } = await supabaseAdmin
      .from("instagram_accounts")
      .upsert({
        workspace_id: workspace_id,
        username: accountInfo.username,
        instagram_account_id: instagramAccount.id,
        facebook_page_id: page.id,
        profile_picture_url: accountInfo.profile_picture_url,
        access_token: pageTokenData.access_token, // Use page token for Instagram API
        token_expires_at: expiresAt.toISOString(),
        token_type: "LONG_LIVED",
        account_type: "Business",
        connected_at: new Date().toISOString(),
      }, {
        onConflict: "workspace_id,instagram_account_id"
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          username: accountInfo.username,
          id: instagramAccount.id,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

## Step 8: Update Frontend - Connect Instagram Flow

Update `src/components/modals/ConnectAccountModal.tsx`:

```typescript
// Add Instagram OAuth flow
const handleInstagramConnect = async () => {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_content_publish',
    'pages_read_engagement',
    'pages_show_list'
  ].join(',');

  // Generate random state for security
  const state = crypto.randomUUID();
  localStorage.setItem('instagram_oauth_state', state);
  localStorage.setItem('instagram_workspace_id', workspace?.id || '');

  // Redirect to Facebook OAuth
  window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes}` +
    `&response_type=code` +
    `&state=${state}`;
};
```

## Step 9: Handle OAuth Callback

Update `src/pages/AuthCallback.tsx` to handle Instagram OAuth:

```typescript
// In AuthCallback component, add Instagram OAuth handling
useEffect(() => {
  const handleInstagramCallback = async () => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = localStorage.getItem("instagram_oauth_state");
    const workspaceId = localStorage.getItem("instagram_workspace_id");

    if (!code || state !== storedState) {
      // Handle error
      return;
    }

    // Clear stored state
    localStorage.removeItem("instagram_oauth_state");
    localStorage.removeItem("instagram_workspace_id");

    // Call Edge Function to complete OAuth
    const { data, error } = await supabase.functions.invoke("instagram-oauth", {
      body: { code, state, workspace_id: workspaceId },
    });

    if (error || data?.error) {
      toast({
        title: "Connection Failed",
        description: error?.message || data?.error,
        variant: "destructive",
      });
      navigate("/accounts");
      return;
    }

    toast({
      title: "Success!",
      description: `Connected Instagram account: @${data.account.username}`,
    });

    navigate("/accounts");
  };

  // Check if this is Instagram OAuth callback
  if (searchParams.get("code") && searchParams.get("state")) {
    handleInstagramCallback();
  }
}, [searchParams]);
```

## Step 10: Create Edge Function for Posting

Create: `supabase/functions/instagram-publish/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { account_id, image_url, caption } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get account with access token
    const { data: account, error: accountError } = await supabaseAdmin
      .from("instagram_accounts")
      .select("instagram_account_id, access_token")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      throw new Error("Instagram account not found");
    }

    // Check token expiration
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      throw new Error("Access token expired. Please reconnect your Instagram account.");
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.instagram_account_id}/media?` +
      `image_url=${encodeURIComponent(image_url)}` +
      `&caption=${encodeURIComponent(caption || "")}` +
      `&access_token=${account.access_token}`
    );

    const containerData = await containerResponse.json();
    if (containerData.error) {
      throw new Error(containerData.error.message);
    }

    const creationId = containerData.id;

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.instagram_account_id}/media_publish?` +
      `creation_id=${creationId}` +
      `&access_token=${account.access_token}`
    );

    const publishData = await publishResponse.json();
    if (publishData.error) {
      throw new Error(publishData.error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        media_id: publishData.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

## Step 11: API Endpoints Reference

### Get Account Info
```
GET https://graph.facebook.com/v18.0/{instagram-account-id}?
  fields=username,profile_picture_url,biography,followers_count,media_count
  &access_token={page-access-token}
```

### Get Media (Posts)
```
GET https://graph.facebook.com/v18.0/{instagram-account-id}/media?
  fields=id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp
  &access_token={page-access-token}
```

### Get Insights
```
GET https://graph.facebook.com/v18.0/{instagram-account-id}/insights?
  metric=impressions,reach,profile_views,website_clicks
  &period=day
  &access_token={page-access-token}
```

### Publish Photo
```
POST https://graph.facebook.com/v18.0/{instagram-account-id}/media
  image_url={url}
  &caption={text}
  &access_token={page-access-token}

Then:
POST https://graph.facebook.com/v18.0/{instagram-account-id}/media_publish
  creation_id={container-id}
  &access_token={page-access-token}
```

## Step 12: Token Refresh

Long-lived tokens expire in 60 days. Implement refresh:

```typescript
// Check token expiration before API calls
const refreshTokenIfNeeded = async (accountId: string) => {
  const { data: account } = await supabase
    .from("instagram_accounts")
    .select("access_token, token_expires_at")
    .eq("id", accountId)
    .single();

  if (!account) return null;

  // Refresh if expires in less than 7 days
  const expiresAt = new Date(account.token_expires_at);
  const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysUntilExpiry < 7) {
    // Exchange for new long-lived token
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${account.access_token}`
    );
    // Update token in database
  }

  return account.access_token;
};
```

## Step 13: Deploy Edge Functions

```bash
# Deploy Instagram OAuth handler
supabase functions deploy instagram-oauth

# Deploy Instagram publish function
supabase functions deploy instagram-publish

# Set environment variables
supabase secrets set FACEBOOK_APP_ID=your-app-id
supabase secrets set FACEBOOK_APP_SECRET=your-app-secret
supabase secrets set INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/callback
```

## Testing

### Test OAuth Flow

1. Click "Connect Instagram" in your app
2. Authorize with Facebook
3. Grant permissions
4. Should redirect back and save account

### Test API Calls

```bash
# Get account info
curl "https://graph.facebook.com/v18.0/{instagram-id}?fields=username&access_token={token}"

# Get media
curl "https://graph.facebook.com/v18.0/{instagram-id}/media?access_token={token}"
```

## Troubleshooting

### "Invalid OAuth Redirect URI"
- Check redirect URI matches exactly in Facebook App settings
- Include both HTTP (dev) and HTTPS (prod) URLs

### "User hasn't authorized the application"
- User needs to grant all requested permissions
- Some permissions require App Review for production

### "Token expired"
- Long-lived tokens last 60 days
- Implement token refresh logic
- Or re-authenticate user

### "No Instagram Business Account"
- User must convert Instagram to Business/Creator account
- Must be connected to a Facebook Page

## Production Checklist

- [ ] App approved by Meta (for production use)
- [ ] All permissions approved
- [ ] HTTPS enabled (required for OAuth)
- [ ] Redirect URIs configured correctly
- [ ] Token refresh implemented
- [ ] Error handling for expired tokens
- [ ] Rate limiting handled (Instagram has limits)

## Rate Limits

Instagram Graph API has rate limits:
- **User-level**: 200 requests per hour per user
- **App-level**: 4,800 requests per hour per app
- **Page-level**: Varies by endpoint

Implement retry logic with exponential backoff.

## Security Best Practices

1. **Never expose App Secret** in frontend code
2. **Store tokens encrypted** in database
3. **Use HTTPS** for all OAuth redirects
4. **Validate state parameter** in OAuth flow
5. **Refresh tokens** before expiration
6. **Revoke tokens** when user disconnects

## Next Steps

1. Complete Facebook App setup
2. Get Instagram Business Account
3. Configure OAuth redirect URIs
4. Deploy Edge Functions
5. Test connection flow
6. Implement posting functionality
7. Add analytics fetching

