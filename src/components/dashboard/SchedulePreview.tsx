import { Calendar, Clock, Image, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScheduledPost {
  id: string;
  type: "image" | "video" | "carousel";
  caption: string;
  account: string;
  scheduledFor: string;
  time: string;
  status: "scheduled" | "pending" | "published";
}

const scheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    type: "image",
    caption: "New product launch announcement! 🚀 Check out our latest...",
    account: "@techstartup",
    scheduledFor: "Today",
    time: "2:00 PM",
    status: "scheduled",
  },
  {
    id: "2",
    type: "video",
    caption: "Behind the scenes of our creative process...",
    account: "@designstudio",
    scheduledFor: "Today",
    time: "5:30 PM",
    status: "scheduled",
  },
  {
    id: "3",
    type: "carousel",
    caption: "5 tips for growing your Instagram following...",
    account: "@growthacademy",
    scheduledFor: "Tomorrow",
    time: "9:00 AM",
    status: "pending",
  },
  {
    id: "4",
    type: "image",
    caption: "Weekend vibes 🌅 What are your plans?",
    account: "@lifestylebrand",
    scheduledFor: "Dec 30",
    time: "11:00 AM",
    status: "scheduled",
  },
];

const PostTypeIcon = ({ type }: { type: ScheduledPost["type"] }) => {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "carousel":
      return <Image className="w-4 h-4" />;
    default:
      return <Image className="w-4 h-4" />;
  }
};

export const SchedulePreview = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Upcoming Posts</h3>
          <p className="text-sm text-muted-foreground">Next 7 days</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          View Calendar
        </Button>
      </div>

      <div className="space-y-3">
        {scheduledPosts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "group flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 animate-slide-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Post Type Icon */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <PostTypeIcon type={post.type} />
            </div>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary">{post.account}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  post.status === "scheduled" && "bg-success/10 text-success",
                  post.status === "pending" && "bg-warning/10 text-warning",
                  post.status === "published" && "bg-muted text-muted-foreground"
                )}>
                  {post.status}
                </span>
              </div>
              <p className="text-sm text-card-foreground line-clamp-1 mb-2">{post.caption}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.scheduledFor}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.time}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded-lg">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
        View all scheduled posts
      </Button>
    </div>
  );
};
