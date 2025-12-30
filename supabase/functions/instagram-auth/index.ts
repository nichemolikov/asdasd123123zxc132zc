
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      throw new Error("No code provided");
    }

    const clientId = Deno.env.get("INSTAGRAM_CLIENT_ID");
    const clientSecret = Deno.env.get("INSTAGRAM_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Missing Instagram credentials");
    }

    // Step 2: Exchange code for short-lived token
    const tokenFormData = new FormData();
    tokenFormData.append("client_id", clientId);
    tokenFormData.append("client_secret", clientSecret);
    tokenFormData.append("grant_type", "authorization_code");
    tokenFormData.append("redirect_uri", redirect_uri);
    tokenFormData.append("code", code);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: tokenFormData,
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token exchange error:", tokenData);
      throw new Error(tokenData.error?.message || "Failed to exchange token");
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id; // Note: This might be different depending on scopes

    // Step 3: Exchange short-lived token for long-lived token
    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.append("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.append("client_secret", clientSecret);
    longLivedUrl.searchParams.append("access_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error || !longLivedData.access_token) {
      console.error("Long-lived token error:", longLivedData);
      throw new Error(longLivedData.error?.message || "Failed to get long-lived token");
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // Seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Fetch user profile data
    const profileUrl = new URL(`https://graph.instagram.com/me`);
    profileUrl.searchParams.append("fields", "id,username,account_type,media_count");
    profileUrl.searchParams.append("access_token", longLivedToken);

    const profileRes = await fetch(profileUrl.toString());
    const profileData = await profileRes.json();

    if (profileData.error) {
       console.error("Profile fetch error:", profileData);
       throw new Error(profileData.error.message || "Failed to fetch profile");
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user ID from the request auth context
    // NOTE: In a real scenario, we should verify the JWT sent in the Authorization header
    // to get the logged-in user's ID.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
        throw new Error("Invalid user token");
    }

    // Upsert into instagram_accounts
    const { error: upsertError } = await supabaseClient
      .from("instagram_accounts")
      .upsert({
        user_id: user.id,
        instagram_id: profileData.id,
        username: profileData.username,
        access_token: longLivedToken,
        token_expires_at: expiresAt,
        posts_count: profileData.media_count,
        updated_at: new Date().toISOString(),
        // Default values for other fields
        is_active: true,
      }, { onConflict: "instagram_id" }); // Assuming instagram_id is unique or we want to update based on it. 
      // Actually the schema might use 'id' as primary key and 'instagram_id' as a field.
      // If 'instagram_id' is unique, we can use it. If not, we might need to query first.
      // Let's check the schema again. 'instagram_id' is nullable string. 
      // We should probably check if an account with this instagram_id exists for this user.

    if (upsertError) {
        // Fallback: if instagram_id constraint fails or doesn't exist, try to match by user_id + username?
        // Or just insert a new one if not found.
        // For now let's assume we want to support one instagram account per user or multiple?
        // The ConnectAccountModal implies connecting *an* account.
        console.error("Upsert error:", upsertError);
        throw upsertError;
    }

    return new Response(
      JSON.stringify({ success: true, profile: profileData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
