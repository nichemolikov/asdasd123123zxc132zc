import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface InstagramAccount {
  id: string;
  username: string;
  avatar_url: string | null;
  followers_count: number;
  posts_count: number;
  total_likes: number;
  avg_likes_per_post: number;
  engagement_rate: number;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const useInstagramAccounts = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
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
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .insert({
          user_id: user.id,
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts((prev) => [data, ...prev]);
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
