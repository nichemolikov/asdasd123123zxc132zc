import { Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const timeSlots = [
  { time: "9 AM", day: "Mon", engagement: 85 },
  { time: "12 PM", day: "Tue", engagement: 92 },
  { time: "6 PM", day: "Wed", engagement: 78 },
  { time: "8 PM", day: "Thu", engagement: 95 },
  { time: "2 PM", day: "Fri", engagement: 88 },
  { time: "11 AM", day: "Sat", engagement: 97 },
  { time: "10 AM", day: "Sun", engagement: 90 },
];

const getEngagementColor = (value: number) => {
  if (value >= 90) return "bg-success";
  if (value >= 80) return "bg-primary";
  if (value >= 70) return "bg-warning";
  return "bg-muted";
};

export const BestTimeToPost = () => {
  const bestTime = timeSlots.reduce((prev, current) => 
    prev.engagement > current.engagement ? prev : current
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Best Time to Post</h3>
          <p className="text-sm text-muted-foreground">Based on your audience activity</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Recommended Time */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-xs font-medium text-success">Highest Engagement</span>
        </div>
        <p className="text-2xl font-bold text-card-foreground mb-1">
          {bestTime.day} at {bestTime.time}
        </p>
        <p className="text-sm text-muted-foreground">
          {bestTime.engagement}% engagement probability
        </p>
      </div>

      {/* Weekly Heatmap */}
      <div className="space-y-2">
        {timeSlots.map((slot, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 animate-slide-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <span className="w-8 text-xs text-muted-foreground">{slot.day}</span>
            <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
              <div 
                className={cn("h-full rounded-lg transition-all duration-500", getEngagementColor(slot.engagement))}
                style={{ width: `${slot.engagement}%` }}
              />
            </div>
            <span className="w-12 text-xs text-right text-muted-foreground">{slot.time}</span>
            <span className="w-10 text-xs text-right font-medium text-card-foreground">{slot.engagement}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
