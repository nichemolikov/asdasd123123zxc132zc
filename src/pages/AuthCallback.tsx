
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("Processing your Instagram connection...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorReason = searchParams.get("error_reason");
      const errorDescription = searchParams.get("error_description");

      // Handle OAuth errors
      if (error) {
        console.error("OAuth Error:", error, errorReason, errorDescription);
        toast({
          title: "Connection Failed",
          description: errorDescription || errorReason || "Failed to connect to Instagram.",
          variant: "destructive",
        });
        navigate("/accounts");
        return;
      }

      // Check if this is Instagram OAuth callback
      const storedState = localStorage.getItem("instagram_oauth_state");
      const workspaceId = localStorage.getItem("instagram_workspace_id");

      if (code && state && storedState === state) {
        // Instagram OAuth callback
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            toast({
              title: "Authentication Required",
              description: "Please log in to connect your Instagram account.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }

          // Clear stored state
          localStorage.removeItem("instagram_oauth_state");
          localStorage.removeItem("instagram_workspace_id");

          // Call Edge Function to complete OAuth
          const { data, error: funcError } = await supabase.functions.invoke("instagram-oauth", {
            body: { 
              code, 
              state,
              workspace_id: workspaceId 
            },
          });

          if (funcError) {
            throw new Error(funcError.message);
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          toast({
            title: "Success!",
            description: `Connected Instagram account: @${data.account.username}`,
          });
          
          navigate("/accounts");
          return;

        } catch (err: any) {
          console.error("Instagram OAuth Callback Error:", err);
          toast({
            title: "Connection Failed",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
          });
          navigate("/accounts");
          return;
        }
      }

      // If no code or state, just redirect
      if (!code) {
        navigate("/dashboard");
        return;
      }

      // Legacy Instagram Basic Display API handling (if needed)
      // This can be removed if you're only using Graph API
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to connect your Instagram account.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const redirectUri = `${window.location.origin}/auth/callback`;

        const { data, error: funcError } = await supabase.functions.invoke("instagram-auth", {
          body: { code, redirect_uri: redirectUri },
        });

        if (funcError) {
          throw new Error(funcError.message);
        }

        if (data?.error) {
           throw new Error(data.error);
        }

        toast({
          title: "Success!",
          description: `Connected Instagram account: ${data.profile?.username || "Unknown"}`,
        });
        
        navigate("/accounts");

      } catch (err: any) {
        console.error("Callback Error:", err);
        toast({
          title: "Connection Failed",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold text-foreground">{status}</h2>
      <p className="text-muted-foreground mt-2">Please do not close this window.</p>
    </div>
  );
};

export default AuthCallback;
