import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { InstagramAccount } from "./useInstagramAccounts";

export interface StatsOverview {
  totalFollowers: number;
  totalPosts: number;
  totalLikes: number;
  avgEngagementRate: number;
  engagementScore: number;
}

export interface ChartDataPoint {
  name: string;
  followers: number;
  engagement: number;
  likes: number;
}

export const useAnalytics = (accounts: InstagramAccount[]) => {
  const [stats, setStats] = useState<StatsOverview>({
    totalFollowers: 0,
    totalPosts: 0,
    totalLikes: 0,
    avgEngagementRate: 0,
    engagementScore: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!user || !workspace) {
      setStats({
        totalFollowers: 0,
        totalPosts: 0,
        totalLikes: 0,
        avgEngagementRate: 0,
        engagementScore: 0,
      });
      setChartData([]);
      return;
    }

    // Try to fetch from dashboard_overview RPC first
    const fetchFromRPC = async () => {
      try {
        const { data, error } = await supabase.rpc("dashboard_overview", {
          p_workspace_id: workspace.id,
        });

        if (!error && data) {
          setStats({
            totalFollowers: data.total_followers || 0,
            totalPosts: data.total_posts || 0,
            totalLikes: data.total_likes_last_30_days || 0,
            avgEngagementRate: data.average_engagement_rate || 0,
            engagementScore: 0, // Will calculate from accounts
          });
          return true; // Success
        }
      } catch (err: any) {
        // Silently handle 404 or function not found - will fall back to accounts
        if (err?.code !== 'PGRST116' && !err?.message?.includes('404')) {
          console.warn("Dashboard overview RPC not available, using account data:", err.message);
        }
      }
      return false; // Failed, use fallback
    };

    // Fetch from RPC if no accounts, otherwise use accounts data
    if (accounts.length === 0) {
      // No accounts, try RPC
      fetchFromRPC();
    } else {
      // Calculate from accounts (more accurate for real-time data)
      const totalFollowers = accounts.reduce((sum, a) => sum + (a.followers_count || 0), 0);
      const totalPosts = accounts.reduce((sum, a) => sum + (a.posts_count || 0), 0);
      const totalLikes = accounts.reduce((sum, a) => sum + (a.total_likes || 0), 0);
      const avgEngagementRate = accounts.length > 0
        ? accounts.reduce((sum, a) => sum + (Number(a.engagement_rate) || 0), 0) / accounts.length
        : 0;

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(100, Math.round(
        (avgEngagementRate * 10) + 
        (Math.log10(totalFollowers + 1) * 5) + 
        (accounts.length * 5)
      ));

      setStats({
        totalFollowers,
        totalPosts,
        totalLikes,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        engagementScore,
      });

      // Generate sample chart data based on current metrics
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const baseFollowers = totalFollowers / 7;
      const baseLikes = totalLikes / 30;
      
      const newChartData = days.map((day, i) => ({
        name: day,
        followers: Math.round(baseFollowers * (0.9 + Math.random() * 0.2)),
        engagement: Math.round((avgEngagementRate * (0.8 + Math.random() * 0.4)) * 100) / 100,
        likes: Math.round(baseLikes * (0.7 + Math.random() * 0.6)),
      }));

      setChartData(newChartData);
    }
  }, [user, workspace, accounts]);

  return {
    stats,
    chartData,
  };
};
