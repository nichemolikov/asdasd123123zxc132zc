import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { useInstagramAccounts } from "@/hooks/useInstagramAccounts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, TrendingUp, Heart, MessageCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for recent posts
const mockPosts = [
  {
    id: "1",
    thumbnail: "https://via.placeholder.com/150",
    caption: "Excited to share our latest product launch! 🚀",
    postedAt: new Date("2024-01-15"),
    likes: 1250,
    comments: 89,
    engagementRate: 4.2,
  },
  {
    id: "2",
    thumbnail: "https://via.placeholder.com/150",
    caption: "Behind the scenes of our creative process...",
    postedAt: new Date("2024-01-14"),
    likes: 980,
    comments: 67,
    engagementRate: 3.8,
  },
  {
    id: "3",
    thumbnail: "https://via.placeholder.com/150",
    caption: "Thank you for 10K followers! 🎉",
    postedAt: new Date("2024-01-13"),
    likes: 2100,
    comments: 145,
    engagementRate: 5.1,
  },
];

const Analytics = () => {
  const { accounts } = useInstagramAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  
  const filteredAccounts = selectedAccount === "all" 
    ? accounts 
    : accounts.filter(acc => acc.id === selectedAccount);
  
  const { stats, chartData } = useAnalytics(filteredAccounts);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track performance and engagement across your accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {dateFrom && dateTo
                  ? `${format(dateFrom, "MMM d")} - ${format(dateTo, "MMM d")}`
                  : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  className="rounded-md border-r"
                />
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  className="rounded-md"
                />
              </div>
            </PopoverContent>
          </Popover>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  @{account.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Followers</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold">{stats.totalFollowers.toLocaleString()}</p>
          <p className="text-xs text-success mt-1">+2.4% from last month</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Posts</p>
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Likes (30d)</p>
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</p>
          <p className="text-xs text-success mt-1">+12.5% from last month</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Engagement</p>
            <MessageCircle className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold">{stats.avgEngagementRate.toFixed(1)}%</p>
          <p className="text-xs text-success mt-1">+0.8% from last month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Followers Over Time</h3>
          <EngagementChart 
            title=""
            subtitle=""
            data={chartData}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Rate Trend</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Engagement trend chart</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Posts Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Posts</h3>
          <p className="text-sm text-muted-foreground">Performance metrics for your latest posts</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <img
                    src={post.thumbnail}
                    alt="Post thumbnail"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium line-clamp-2 max-w-xs">
                    {post.caption}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {format(post.postedAt, "MMM d, yyyy")}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="font-medium">{post.likes.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span className="font-medium">{post.comments.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={post.engagementRate >= 4 ? "default" : "secondary"}>
                    {post.engagementRate.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Analytics;

