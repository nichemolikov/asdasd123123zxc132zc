import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";

export interface InstagramAccount {
  id: string;
  workspace_id: string;
  username: string;
  profile_picture_url: string | null;
  account_type: string | null;
  external_id: string | null;
  followers_count?: number;
  posts_count?: number;
  total_likes?: number;
  avg_likes_per_post?: number;
  engagement_rate?: number;
  last_synced_at: string | null;
  connected_at: string;
  created_at: string;
}

export const useInstagramAccounts = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const fetchAccounts = async () => {
    if (!user || !workspace) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get latest analytics snapshot for each account
      const accountsWithStats = await Promise.all(
        (data || []).map(async (account) => {
          const { data: snapshot } = await supabase
            .from("analytics_snapshots")
            .select("followers_count, posts_count, total_likes, engagement_rate")
            .eq("instagram_account_id", account.id)
            .order("snapshot_date", { ascending: false })
            .limit(1)
            .single();

          return {
            ...account,
            followers_count: snapshot?.followers_count || 0,
            posts_count: snapshot?.posts_count || 0,
            total_likes: snapshot?.total_likes || 0,
            avg_likes_per_post: snapshot?.posts_count
              ? (snapshot.total_likes || 0) / snapshot.posts_count
              : 0,
            engagement_rate: snapshot?.engagement_rate || 0,
            avatar_url: account.profile_picture_url, // For backward compatibility
          };
        })
      );

      setAccounts(accountsWithStats);
    } catch (error: any) {
      toast({
        title: "Error fetching accounts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (username: string) => {
    if (!user || !workspace) return null;

    try {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .insert({
          workspace_id: workspace.id,
          username,
          profile_picture_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
          account_type: "Personal",
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts((prev) => [{ ...data, avatar_url: data.profile_picture_url }, ...prev]);
      toast({
        title: "Account connected!",
        description: `@${username} has been added to your dashboard.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding account",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const removeAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("instagram_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Account removed",
        description: "The account has been disconnected.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
    refetch: fetchAccounts,
  };
};
