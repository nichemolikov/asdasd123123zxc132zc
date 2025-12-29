import { Users, Image, Heart, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

export const StatsOverview = () => {
  const stats = [
    {
      title: "Total Followers",
      value: "248.5K",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <Users className="w-5 h-5 text-primary" />,
    },
    {
      title: "Total Posts",
      value: "1,847",
      change: "+28 this week",
      changeType: "positive" as const,
      icon: <Image className="w-5 h-5 text-accent" />,
    },
    {
      title: "Total Engagement",
      value: "1.2M",
      change: "+8.3%",
      changeType: "positive" as const,
      icon: <Heart className="w-5 h-5 text-destructive" />,
    },
    {
      title: "Avg. Engagement Rate",
      value: "4.8%",
      change: "+0.6%",
      changeType: "positive" as const,
      icon: <TrendingUp className="w-5 h-5 text-success" />,
    },
    {
      title: "Engagement Score",
      value: "87/100",
      change: "Excellent",
      changeType: "positive" as const,
      icon: <Zap className="w-5 h-5 text-warning" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 50} />
      ))}
    </div>
  );
};
