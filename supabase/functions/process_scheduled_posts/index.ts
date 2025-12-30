// Edge Function: Process Scheduled Posts
// Runs every 5 minutes via Supabase Cron
// Publishes scheduled posts that are due

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

    // Get all scheduled posts that are due
    const now = new Date().toISOString();
    const { data: scheduledPosts, error: fetchError } = await supabaseAdmin
      .from("scheduled_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(100);

    if (fetchError) {
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts to process", processed: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        // Update status to processing
        await supabaseAdmin
          .from("scheduled_posts")
          .update({ status: "processing" })
          .eq("id", post.id);

        // Simulate publishing to Instagram
        // In production, this would call Instagram Graph API
        const publishedAt = new Date().toISOString();
        const externalPostId = `ig_${Date.now()}_${post.id.substring(0, 8)}`;

        // Update post as published
        const { error: updateError } = await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status: "published",
            published_at: publishedAt,
            external_post_id: externalPostId,
            updated_at: publishedAt,
          })
          .eq("id", post.id);

        if (updateError) {
          throw updateError;
        }

        // Create post_performance entry with simulated metrics
        const { error: perfError } = await supabaseAdmin
          .from("post_performances")
          .insert({
            instagram_account_id: post.instagram_account_id,
            external_post_id: externalPostId,
            posted_at: publishedAt,
            likes: Math.floor(Math.random() * 500) + 50, // Random 50-550 likes
            comments: Math.floor(Math.random() * 50) + 5, // Random 5-55 comments
            reach: Math.floor(Math.random() * 2000) + 500,
            saves: Math.floor(Math.random() * 100) + 10,
            engagement_rate: Math.random() * 5 + 2, // Random 2-7%
          });

        if (perfError) {
          console.error("Error creating post_performance:", perfError);
          // Don't fail the whole operation, just log it
        }

        results.processed++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Post ${post.id}: ${error.message}`);

        // Mark post as failed
        await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", post.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Processing complete",
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

