import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, state, workspace_id } = await req.json();
    
    if (!code) {
      throw new Error("Authorization code is required");
    }

    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");
    const redirectUri = Deno.env.get("INSTAGRAM_REDIRECT_URI") || "http://localhost:8080/auth/callback";

    if (!appId || !appSecret) {
      throw new Error("Instagram API credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in Supabase secrets.");
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
      throw new Error(tokenData.error.message || "Failed to exchange authorization code");
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
      throw new Error(longLivedData.error.message || "Failed to get long-lived token");
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days in seconds

    // 3. Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      throw new Error(pagesData.error.message || "Failed to get Facebook pages");
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook pages found. Please create a Facebook Page and connect it to your Instagram account.");
    }

    // 4. Get Instagram Business Account for the first page
    const page = pagesData.data[0];
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?` +
      `fields=instagram_business_account&access_token=${longLivedToken}`
    );
    const instagramData = await instagramResponse.json();

    if (instagramData.error) {
      throw new Error(instagramData.error.message || "Failed to get Instagram account");
    }

    if (!instagramData.instagram_business_account) {
      throw new Error("No Instagram Business Account found. Please convert your Instagram account to Business or Creator and connect it to a Facebook Page.");
    }

    const instagramAccount = instagramData.instagram_business_account;

    // 5. Get page access token (needed for Instagram API calls)
    const pageTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?` +
      `fields=access_token&access_token=${longLivedToken}`
    );
    const pageTokenData = await pageTokenResponse.json();

    if (pageTokenData.error || !pageTokenData.access_token) {
      throw new Error("Failed to get page access token");
    }

    // 6. Get Instagram account info
    const accountInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccount.id}?` +
      `fields=username,profile_picture_url,biography,followers_count,media_count&access_token=${pageTokenData.access_token}`
    );
    const accountInfo = await accountInfoResponse.json();

    if (accountInfo.error) {
      throw new Error(accountInfo.error.message || "Failed to get Instagram account info");
    }

    // 7. Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    // Get workspace_id from request or use default
    let finalWorkspaceId = workspace_id;

    if (!finalWorkspaceId) {
      // Try to get from user's session if available
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          // Get user's workspace
          const { data: workspaceData } = await supabaseAdmin
            .from("workspace_users")
            .select("workspace_id")
            .eq("user_id", (
              await supabaseAdmin
                .from("users")
                .select("id")
                .eq("auth_user_id", user.id)
                .single()
            ).data?.id)
            .limit(1)
            .single();
          
          if (workspaceData) {
            finalWorkspaceId = workspaceData.workspace_id;
          }
        }
      }
    }

    if (!finalWorkspaceId) {
      throw new Error("Workspace ID is required. Please ensure you're logged in and have a workspace.");
    }

    const { error: dbError } = await supabaseAdmin
      .from("instagram_accounts")
      .upsert({
        workspace_id: finalWorkspaceId,
        username: accountInfo.username,
        instagram_account_id: instagramAccount.id,
        facebook_page_id: page.id,
        profile_picture_url: accountInfo.profile_picture_url,
        access_token: pageTokenData.access_token, // Use page token for Instagram API
        token_expires_at: expiresAt.toISOString(),
        token_type: "LONG_LIVED",
        account_type: "Business",
        connected_at: new Date().toISOString(),
        followers_count: accountInfo.followers_count || 0,
        bio: accountInfo.biography || null,
      }, {
        onConflict: "workspace_id,instagram_account_id"
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save Instagram account: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          username: accountInfo.username,
          id: instagramAccount.id,
          profile_picture_url: accountInfo.profile_picture_url,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Instagram OAuth error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

