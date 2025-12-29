import { Users, Image, Heart, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsOverview as StatsOverviewType } from "@/hooks/useAnalytics";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  delay?: number;
}

const StatCard = ({ title, value, change, changeType, icon, delay = 0 }: StatCardProps) => (
  <div 
    className="bg-card rounded-2xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <span className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        changeType === "positive" && "bg-success/10 text-success",
        changeType === "negative" && "bg-destructive/10 text-destructive",
        changeType === "neutral" && "bg-muted text-muted-foreground"
      )}>
        {change}
      </span>
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
    </div>
  </div>
);

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

interface StatsOverviewProps {
  stats: StatsOverviewType;
  loading?: boolean;
}

export const StatsOverview = ({ stats, loading }: StatsOverviewProps) => {
  const statCards = [
    {
      title: "Total Followers",
      value: formatNumber(stats.totalFollowers),
      change: stats.totalFollowers > 0 ? "+12.5%" : "No data",
      changeType: stats.totalFollowers > 0 ? "positive" as const : "neutral" as const,
      icon: <Users className="w-5 h-5 text-primary" />,
    },
    {
      title: "Total Posts",
      value: formatNumber(stats.totalPosts),
      change: stats.totalPosts > 0 ? "+28 this week" : "No data",
      changeType: stats.totalPosts > 0 ? "positive" as const : "neutral" as const,
      icon: <Image className="w-5 h-5 text-accent" />,
    },
    {
      title: "Total Engagement",
      value: formatNumber(stats.totalLikes),
      change: stats.totalLikes > 0 ? "+8.3%" : "No data",
      changeType: stats.totalLikes > 0 ? "positive" as const : "neutral" as const,
      icon: <Heart className="w-5 h-5 text-destructive" />,
    },
    {
      title: "Avg. Engagement Rate",
      value: `${stats.avgEngagementRate}%`,
      change: stats.avgEngagementRate > 0 ? "+0.6%" : "No data",
      changeType: stats.avgEngagementRate > 0 ? "positive" as const : "neutral" as const,
      icon: <TrendingUp className="w-5 h-5 text-success" />,
    },
    {
      title: "Engagement Score",
      value: `${stats.engagementScore}/100`,
      change: stats.engagementScore >= 70 ? "Excellent" : stats.engagementScore >= 40 ? "Good" : "Building",
      changeType: stats.engagementScore >= 70 ? "positive" as const : stats.engagementScore >= 40 ? "neutral" as const : "neutral" as const,
      icon: <Zap className="w-5 h-5 text-warning" />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
            <div className="w-11 h-11 rounded-xl bg-muted mb-4" />
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 50} />
      ))}
    </div>
  );
};
