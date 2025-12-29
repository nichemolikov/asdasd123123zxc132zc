import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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

  useEffect(() => {
    if (!user || accounts.length === 0) {
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

    // Calculate aggregated stats
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
  }, [user, accounts]);

  return {
    stats,
    chartData,
  };
};
