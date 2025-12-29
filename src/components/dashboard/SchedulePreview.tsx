import { Calendar, Clock, Image, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScheduledPost } from "@/hooks/useScheduledPosts";
import { format, isToday, isTomorrow } from "date-fns";

interface SchedulePreviewProps {
  scheduledPosts: ScheduledPost[];
  loading?: boolean;
}

const PostTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "carousel":
      return <Image className="w-4 h-4" />;
    default:
      return <Image className="w-4 h-4" />;
  }
};

const formatScheduleDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
};

const formatScheduleTime = (dateStr: string): string => {
  return format(new Date(dateStr), "h:mm a");
};

export const SchedulePreview = ({ scheduledPosts, loading }: SchedulePreviewProps) => {
  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-4 w-48 bg-muted rounded mb-2" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {scheduledPosts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No scheduled posts</p>
          <p className="text-sm">Schedule your first post to see it here</p>
        </div>
      ) : (
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
                <PostTypeIcon type={post.media_type} />
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    @{post.instagram_accounts?.username || "Unknown"}
                  </span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    post.status === "pending" && "bg-warning/10 text-warning",
                    post.status === "published" && "bg-success/10 text-success",
                    post.status === "failed" && "bg-destructive/10 text-destructive"
                  )}>
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-card-foreground line-clamp-1 mb-2">
                  {post.caption || "No caption"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatScheduleDate(post.scheduled_for)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatScheduleTime(post.scheduled_for)}
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
      )}

      <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
        View all scheduled posts
      </Button>
    </div>
  );
};
