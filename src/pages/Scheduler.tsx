import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon, Image, Video, Grid3x3, Clock } from "lucide-react";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { useInstagramAccounts } from "@/hooks/useInstagramAccounts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Scheduler = () => {
  const { scheduledPosts, loading, createScheduledPost, deleteScheduledPost, refetch } = useScheduledPosts();
  const { accounts } = useInstagramAccounts();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    accountId: "",
    mediaType: "image",
    caption: "",
    hashtags: "",
    mediaUrl: ""
  });

  const handleSchedule = async () => {
    if (!formData.accountId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(":");
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    const hashtagsArray = formData.hashtags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const result = await createScheduledPost({
      account_id: formData.accountId,
      caption: formData.caption,
      media_type: formData.mediaType,
      media_urls: formData.mediaUrl ? [formData.mediaUrl] : [],
      hashtags: hashtagsArray,
      scheduled_for: scheduledDateTime.toISOString(),
    });

    setIsModalOpen(false);
    setFormData({
      accountId: "",
      mediaType: "image",
      caption: "",
      hashtags: "",
      mediaUrl: ""
    });
    setSelectedDate(new Date());
    setSelectedTime("");
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      published: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "carousel":
        return <Grid3x3 className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduler</h1>
          <p className="text-muted-foreground">Schedule and manage your Instagram posts</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Scheduled Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Instagram Account</Label>
                <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Media Type</Label>
                <Select value={formData.mediaType} onValueChange={(value) => setFormData({ ...formData, mediaType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Media URL</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the URL of your media file
                </p>
              </div>

              <div>
                <Label>Caption</Label>
                <Textarea
                  placeholder="Write your caption here..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>Hashtags (comma-separated)</Label>
                <Input
                  placeholder="marketing, business, instagram"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Schedule Date</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                <div>
                  <Label>Schedule Time</Label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={handleSchedule} className="w-full" variant="gradient">
                Schedule Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-48 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : scheduledPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
          <p className="text-muted-foreground mb-4">
            Schedule your first post to get started
          </p>
          <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduledPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {post.media_urls && post.media_urls.length > 0 ? (
                  <img
                    src={post.media_urls[0]}
                    alt="Scheduled post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {getMediaIcon(post.media_type || "image")}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {post.instagram_accounts && (
                      <>
                        <img
                          src={post.instagram_accounts.avatar_url || `https://ui-avatars.com/api/?name=${post.instagram_accounts.username}`}
                          alt={post.instagram_accounts.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">@{post.instagram_accounts.username}</span>
                      </>
                    )}
                  </div>
                  {getStatusBadge(post.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {post.caption || "No caption"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{format(new Date(post.scheduled_for), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => deleteScheduledPost(post.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scheduler;

