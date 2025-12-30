import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";

export interface ScheduledPost {
  id: string;
  workspace_id: string;
  instagram_account_id: string;
  caption: string | null;
  media_type: string;
  media_urls: string[] | any; // JSONB array
  hashtags: string | null;
  scheduled_at: string;
  status: string;
  published_at: string | null;
  created_at: string;
  instagram_accounts?: {
    username: string;
    profile_picture_url: string | null;
  };
}

export const useScheduledPosts = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const fetchScheduledPosts = async () => {
    if (!user || !workspace) {
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
            profile_picture_url
          )
        `)
        .eq("workspace_id", workspace.id)
        .eq("status", "scheduled")
        .order("scheduled_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      
      // Transform data for backward compatibility
      const transformed = (data || []).map((post) => ({
        ...post,
        scheduled_for: post.scheduled_at, // For backward compatibility
        media_urls: Array.isArray(post.media_urls) 
          ? post.media_urls 
          : typeof post.media_urls === 'string' 
            ? JSON.parse(post.media_urls) 
            : [],
        hashtags: typeof post.hashtags === 'string' 
          ? post.hashtags.split(',').map(h => h.trim()) 
          : [],
        instagram_accounts: post.instagram_accounts ? {
          ...post.instagram_accounts,
          avatar_url: post.instagram_accounts.profile_picture_url
        } : undefined
      }));
      
      setScheduledPosts(transformed);
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
    if (!user || !workspace) return null;

    try {
      // Convert hashtags array to string
      const hashtagsString = post.hashtags?.join(', ') || null;
      
      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert({
          workspace_id: workspace.id,
          instagram_account_id: post.account_id,
          caption: post.caption || null,
          media_type: post.media_type || "image",
          media_urls: post.media_urls || [],
          hashtags: hashtagsString,
          scheduled_at: post.scheduled_for,
          status: "scheduled",
        })
        .select(`
          *,
          instagram_accounts (
            username,
            profile_picture_url
          )
        `)
        .single();

      if (error) throw error;

      // Transform for backward compatibility
      const transformed = {
        ...data,
        scheduled_for: data.scheduled_at,
        media_urls: Array.isArray(data.media_urls) ? data.media_urls : [],
        hashtags: typeof data.hashtags === 'string' 
          ? data.hashtags.split(',').map((h: string) => h.trim()) 
          : [],
        instagram_accounts: data.instagram_accounts ? {
          ...data.instagram_accounts,
          avatar_url: data.instagram_accounts.profile_picture_url
        } : undefined
      };

      setScheduledPosts((prev) => [...prev, transformed].sort(
        (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      ));

      toast({
        title: "Post scheduled!",
        description: "Your post has been scheduled successfully.",
      });
      return transformed;
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
