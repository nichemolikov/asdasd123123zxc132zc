import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

interface Subscription {
  id: string;
  workspace_id: string;
  plan: {
    id: string;
    name: string;
    max_accounts: number;
    price_per_month: number;
  };
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  subscription: Subscription | null;
  loading: boolean;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  subscription: null,
  loading: true,
  refreshWorkspace: async () => {},
});

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshWorkspace = async () => {
    if (!user) {
      setWorkspace(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("current_workspace");

      if (error) {
        // If RPC function doesn't exist, that's OK for new setups
        if (error.message?.includes("function") || error.message?.includes("does not exist")) {
          console.warn("RPC function 'current_workspace' not found. Run migrations to create it.");
          setLoading(false);
          return;
        }
        
        // If user not found, try to bootstrap them
        if (error.message?.includes("User not found") || error.message?.includes("user not found")) {
          console.log("User not found in public.users, attempting to bootstrap...");
          try {
            const { data: bootstrapData, error: bootstrapError } = await supabase.rpc("signup_bootstrap", {
              workspace_name: "My Workspace"
            });
            
            if (bootstrapError) {
              console.error("Bootstrap failed:", bootstrapError);
              toast({
                title: "Setup Required",
                description: "Please sign up again to create your workspace, or contact support.",
                variant: "destructive",
              });
              setLoading(false);
              return;
            }
            
            // Retry getting workspace after bootstrap
            const { data: retryData, error: retryError } = await supabase.rpc("current_workspace");
            if (retryError) throw retryError;
            
            if (retryData?.workspace) {
              setWorkspace(retryData.workspace as Workspace);
              setSubscription(retryData.subscription as Subscription | null);
              toast({
                title: "Workspace Created",
                description: "Your workspace has been set up successfully!",
              });
            }
            return;
          } catch (bootstrapErr: any) {
            console.error("Bootstrap error:", bootstrapErr);
            toast({
              title: "Setup Error",
              description: "Unable to create workspace. Please try signing up again.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
        
        throw error;
      }

      if (data?.workspace) {
        setWorkspace(data.workspace as Workspace);
        setSubscription(data.subscription as Subscription | null);
      } else {
        // No workspace found - try to bootstrap
        console.log("No workspace found for user, attempting to bootstrap...");
        try {
          const { data: bootstrapData, error: bootstrapError } = await supabase.rpc("signup_bootstrap", {
            workspace_name: "My Workspace"
          });
          
          if (!bootstrapError && bootstrapData) {
            // Retry getting workspace
            const { data: retryData } = await supabase.rpc("current_workspace");
            if (retryData?.workspace) {
              setWorkspace(retryData.workspace as Workspace);
              setSubscription(retryData.subscription as Subscription | null);
            }
          }
        } catch (bootstrapErr) {
          console.error("Bootstrap error:", bootstrapErr);
        }
      }
    } catch (error: any) {
      console.error("Error fetching workspace:", error);
      // Don't show toast for missing RPC function - it's expected for new setups
      if (!error.message?.includes("function") && !error.message?.includes("does not exist")) {
        toast({
          title: "Error loading workspace",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshWorkspace();
    } else {
      setWorkspace(null);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{ workspace, subscription, loading, refreshWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

