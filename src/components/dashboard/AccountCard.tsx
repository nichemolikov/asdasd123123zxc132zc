import { Heart, MessageCircle, Users, Image, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  username: string;
  avatar: string;
  followers: number;
  posts: number;
  totalLikes: number;
  avgLikes: number;
  engagementRate: number;
  lastPostDate: string;
  trend: "up" | "down" | "stable";
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const AccountCard = ({
  username,
  avatar,
  followers,
  posts,
  totalLikes,
  avgLikes,
  engagementRate,
  lastPostDate,
  trend,
  className,
}: AccountCardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : TrendingUp;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className={cn(
      "group relative bg-card rounded-2xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={avatar}
            alt={username}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-success-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">@{username}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendIcon className={cn("w-3 h-3", trendColor)} />
            <span className={trendColor}>
              {trend === "up" ? "Growing" : trend === "down" ? "Declining" : "Stable"}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">{engagementRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Engagement</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3 transition-colors hover:bg-secondary">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <p className="text-lg font-semibold text-card-foreground">{formatNumber(followers)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 transition-colors hover:bg-secondary">
          <div className="flex items-center gap-2 mb-1">
            <Image className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <p className="text-lg font-semibold text-card-foreground">{formatNumber(posts)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 transition-colors hover:bg-secondary">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Total Likes</span>
          </div>
          <p className="text-lg font-semibold text-card-foreground">{formatNumber(totalLikes)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 transition-colors hover:bg-secondary">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Avg Likes</span>
          </div>
          <p className="text-lg font-semibold text-card-foreground">{formatNumber(avgLikes)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Last post: {lastPostDate}</span>
        <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
};
