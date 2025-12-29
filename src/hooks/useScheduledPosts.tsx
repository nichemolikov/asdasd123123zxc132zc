import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ScheduledPost {
  id: string;
  account_id: string;
  caption: string | null;
  media_type: string;
  media_urls: string[];
  hashtags: string[];
  scheduled_for: string;
  status: string;
  created_at: string;
  instagram_accounts?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useScheduledPosts = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledPosts = async () => {
    if (!user) {
      setScheduledPosts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select(`
          *,
          instagram_accounts (
            username,
            avatar_url
          )
        `)
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true })
        .limit(5);

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching scheduled posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createScheduledPost = async (post: {
    account_id: string;
    caption?: string;
    media_type?: string;
    media_urls?: string[];
    hashtags?: string[];
    scheduled_for: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert({
          ...post,
          user_id: user.id,
          status: "pending",
        })
        .select(`
          *,
          instagram_accounts (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setScheduledPosts((prev) => [...prev, data].sort(
        (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      ).slice(0, 5));

      toast({
        title: "Post scheduled!",
        description: "Your post has been scheduled successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error scheduling post",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteScheduledPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Post deleted",
        description: "The scheduled post has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [user]);

  return {
    scheduledPosts,
    loading,
    createScheduledPost,
    deleteScheduledPost,
    refetch: fetchScheduledPosts,
  };
};
