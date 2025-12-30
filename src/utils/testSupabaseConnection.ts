// Utility to test Supabase connection
import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  const results = {
    connection: false,
    auth: false,
    database: false,
    errors: [] as string[],
    details: {} as Record<string, any>,
  };

  try {
    // 1. Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    results.details.env = {
      url: supabaseUrl ? "✅ Set" : "❌ Missing",
      key: supabaseKey ? "✅ Set" : "❌ Missing",
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Not set",
    };

    if (!supabaseUrl || !supabaseKey) {
      results.errors.push("Missing environment variables");
      return results;
    }

    // 2. Test basic connection
    try {
      const { data, error } = await supabase.from("users").select("count").limit(0);
      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine
        throw error;
      }
      results.connection = true;
      results.details.connection = "✅ Connected";
    } catch (error: any) {
      results.errors.push(`Connection error: ${error.message}`);
      results.details.connection = `❌ ${error.message}`;
    }

    // 3. Test authentication
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.auth = true;
      results.details.auth = session
        ? `✅ Authenticated (User: ${session.user.email})`
        : "✅ Auth service available (not logged in)";
    } catch (error: any) {
      results.errors.push(`Auth error: ${error.message}`);
      results.details.auth = `❌ ${error.message}`;
    }

    // 4. Test database access (check if tables exist)
    try {
      const tables = ["users", "workspaces", "instagram_accounts", "scheduled_posts"];
      const tableChecks: Record<string, boolean> = {};

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count").limit(0);
          tableChecks[table] = !error || error.code === "PGRST116";
        } catch {
          tableChecks[table] = false;
        }
      }

      results.database = Object.values(tableChecks).some((exists) => exists);
      results.details.tables = tableChecks;
    } catch (error: any) {
      results.errors.push(`Database error: ${error.message}`);
      results.details.database = `❌ ${error.message}`;
    }

    // 5. Test RPC functions
    try {
      const { error } = await supabase.rpc("current_workspace");
      // Error is expected if not authenticated, but function should exist
      if (error && !error.message.includes("authenticated") && !error.message.includes("not found")) {
        throw error;
      }
      results.details.rpc = "✅ RPC functions accessible";
    } catch (error: any) {
      if (error.message.includes("not found")) {
        results.errors.push("RPC functions not found - run migrations");
        results.details.rpc = "❌ RPC functions not found";
      } else {
        results.details.rpc = "✅ RPC functions accessible (auth required)";
      }
    }
  } catch (error: any) {
    results.errors.push(`Unexpected error: ${error.message}`);
  }

  return results;
};

