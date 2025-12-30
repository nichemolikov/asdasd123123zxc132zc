// Edge Function: Daily Analytics Snapshot
// Runs once per day via Supabase Cron
// Creates analytics snapshots and generates alerts

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
    // Create Supabase client with service role (bypasses RLS)
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

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const results = {
      snapshots_created: 0,
      alerts_created: 0,
      errors: [] as string[],
    };

    // Get all active Instagram accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("instagram_accounts")
      .select("id, workspace_id");

    if (accountsError) {
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No accounts to process",
          ...results,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Process each account
    for (const account of accounts) {
      try {
        // Aggregate post performances for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: performances, error: perfError } = await supabaseAdmin
          .from("post_performances")
          .select("likes, comments, engagement_rate")
          .eq("instagram_account_id", account.id)
          .gte("posted_at", thirtyDaysAgo.toISOString());

        if (perfError) {
          throw perfError;
        }

        // Calculate metrics
        const totalLikes = performances?.reduce(
          (sum, p) => sum + (p.likes || 0),
          0
        ) || 0;
        const totalComments = performances?.reduce(
          (sum, p) => sum + (p.comments || 0),
          0
        ) || 0;
        const postsCount = performances?.length || 0;

        // Get latest snapshot for followers count (or use placeholder)
        const { data: latestSnapshot } = await supabaseAdmin
          .from("analytics_snapshots")
          .select("followers_count")
          .eq("instagram_account_id", account.id)
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        const followersCount =
          latestSnapshot?.followers_count ||
          Math.floor(Math.random() * 10000) + 1000; // Placeholder

        // Calculate engagement rate: (likes + comments) / followers * 100
        const engagementRate =
          followersCount > 0
            ? ((totalLikes + totalComments) / followersCount) * 100
            : 0;

        // Upsert analytics snapshot
        const { error: snapshotError } = await supabaseAdmin
          .from("analytics_snapshots")
          .upsert(
            {
              instagram_account_id: account.id,
              snapshot_date: today,
              followers_count: followersCount,
              posts_count: postsCount,
              total_likes: totalLikes,
              total_comments: totalComments,
              engagement_rate: Math.round(engagementRate * 1000) / 1000, // Round to 3 decimals
            },
            {
              onConflict: "instagram_account_id,snapshot_date",
            }
          );

        if (snapshotError) {
          throw snapshotError;
        }

        results.snapshots_created++;

        // Alert Logic: Check for engagement drops
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Get engagement rates for last 7 days and previous 7 days
        const { data: recentSnapshots } = await supabaseAdmin
          .from("analytics_snapshots")
          .select("engagement_rate, snapshot_date")
          .eq("instagram_account_id", account.id)
          .gte("snapshot_date", fourteenDaysAgo.toISOString().split("T")[0])
          .order("snapshot_date", { ascending: false });

        if (recentSnapshots && recentSnapshots.length >= 2) {
          const recentAvg =
            recentSnapshots
              .filter(
                (s) =>
                  new Date(s.snapshot_date) >=
                  new Date(sevenDaysAgo.toISOString().split("T")[0])
              )
              .reduce((sum, s) => sum + (s.engagement_rate || 0), 0) /
            recentSnapshots.filter(
              (s) =>
                new Date(s.snapshot_date) >=
                new Date(sevenDaysAgo.toISOString().split("T")[0])
            ).length;

          const previousAvg =
            recentSnapshots
              .filter(
                (s) =>
                  new Date(s.snapshot_date) <
                    new Date(sevenDaysAgo.toISOString().split("T")[0]) &&
                  new Date(s.snapshot_date) >=
                    new Date(fourteenDaysAgo.toISOString().split("T")[0])
              )
              .reduce((sum, s) => sum + (s.engagement_rate || 0), 0) /
            recentSnapshots.filter(
              (s) =>
                new Date(s.snapshot_date) <
                  new Date(sevenDaysAgo.toISOString().split("T")[0]) &&
                new Date(s.snapshot_date) >=
                  new Date(fourteenDaysAgo.toISOString().split("T")[0])
            ).length;

          // Check for engagement drop > 15%
          if (
            previousAvg > 0 &&
            recentAvg < previousAvg &&
            (previousAvg - recentAvg) / previousAvg > 0.15
          ) {
            const dropPercent = Math.round(
              ((previousAvg - recentAvg) / previousAvg) * 100
            );
            await supabaseAdmin.from("alerts").insert({
              workspace_id: account.workspace_id,
              instagram_account_id: account.id,
              type: "engagement_drop",
              message: `Engagement dropped ${dropPercent}% in the last 7 days`,
            });
            results.alerts_created++;
          }
        }

        // Alert Logic: Check for low posting frequency
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const { data: recentPosts } = await supabaseAdmin
          .from("post_performances")
          .select("id")
          .eq("instagram_account_id", account.id)
          .gte("posted_at", tenDaysAgo.toISOString())
          .limit(1);

        if (!recentPosts || recentPosts.length === 0) {
          await supabaseAdmin.from("alerts").insert({
            workspace_id: account.workspace_id,
            instagram_account_id: account.id,
            type: "posting_low",
            message: "Posting frequency is low. Consider posting more regularly.",
          });
          results.alerts_created++;
        }
      } catch (error: any) {
        results.errors.push(`Account ${account.id}: ${error.message}`);
        console.error(`Error processing account ${account.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily analytics snapshot complete",
        ...results,
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
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

