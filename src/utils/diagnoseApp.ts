// Diagnostic utility to check app health
export const diagnoseApp = () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing",
    },
    errors: [] as string[],
    warnings: [] as string[],
  };

  // Check environment variables
  if (!import.meta.env.VITE_SUPABASE_URL) {
    diagnostics.errors.push("VITE_SUPABASE_URL is missing");
  }

  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    diagnostics.errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is missing");
  }

  // Check localStorage
  try {
    const testKey = "__diagnostic_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
  } catch (e) {
    diagnostics.errors.push("localStorage is not available");
  }

  // Check if React is loaded
  if (typeof window !== "undefined" && !(window as any).React) {
    diagnostics.warnings.push("React may not be fully loaded");
  }

  return diagnostics;
};

// Run diagnostics and log to console
if (typeof window !== "undefined") {
  console.log("🔍 App Diagnostics:", diagnoseApp());
}

