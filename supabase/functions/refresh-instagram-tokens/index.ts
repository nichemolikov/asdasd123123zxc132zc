
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Find accounts with tokens expiring in the next 10 days
    // token_expires_at is a timestamptz
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const { data: accounts, error: fetchError } = await supabaseAdmin
      .from("instagram_accounts")
      .select("id, access_token, token_expires_at, username")
      .lt("token_expires_at", tenDaysFromNow.toISOString())
      .not("access_token", "is", null);

    if (fetchError) {
      throw fetchError;
    }

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tokens need refreshing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
        refreshed: 0,
        failed: 0,
        errors: [] as any[]
    };

    for (const account of accounts) {
        try {
            const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.access_token}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.error || !data.access_token) {
                console.error(`Failed to refresh token for ${account.username}:`, data);
                results.failed++;
                results.errors.push({ user: account.username, error: data.error });
                continue;
            }

            const newExpiresIn = data.expires_in; // Seconds
            const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000).toISOString();

            const { error: updateError } = await supabaseAdmin
                .from("instagram_accounts")
                .update({
                    access_token: data.access_token,
                    token_expires_at: newExpiresAt,
                    updated_at: new Date().toISOString()
                })
                .eq("id", account.id);

            if (updateError) {
                 console.error(`Failed to update DB for ${account.username}:`, updateError);
                 results.failed++;
                 results.errors.push({ user: account.username, error: updateError });
            } else {
                results.refreshed++;
            }

        } catch (err) {
            console.error(`Exception refreshing token for ${account.username}:`, err);
            results.failed++;
            results.errors.push({ user: account.username, error: err });
        }
    }

    return new Response(
      JSON.stringify(results),
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
