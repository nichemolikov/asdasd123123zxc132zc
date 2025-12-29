import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { SchedulePreview } from "@/components/dashboard/SchedulePreview";
import { BestTimeToPost } from "@/components/dashboard/BestTimeToPost";
import { ConnectAccountModal } from "@/components/modals/ConnectAccountModal";

const mockAccounts = [
  {
    username: "techstartup",
    avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop",
    followers: 45200,
    posts: 342,
    totalLikes: 128500,
    avgLikes: 3750,
    engagementRate: 5.2,
    lastPostDate: "2 hours ago",
    trend: "up" as const,
  },
  {
    username: "designstudio",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
    followers: 89400,
    posts: 567,
    totalLikes: 456200,
    avgLikes: 8050,
    engagementRate: 4.8,
    lastPostDate: "5 hours ago",
    trend: "up" as const,
  },
  {
    username: "growthacademy",
    avatar: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=200&fit=crop",
    followers: 67800,
    posts: 234,
    totalLikes: 234100,
    avgLikes: 10000,
    engagementRate: 6.1,
    lastPostDate: "1 day ago",
    trend: "stable" as const,
  },
  {
    username: "lifestylebrand",
    avatar: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop",
    followers: 46100,
    posts: 189,
    totalLikes: 189400,
    avgLikes: 10020,
    engagementRate: 3.9,
    lastPostDate: "3 days ago",
    trend: "down" as const,
  },
];

const Index = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleNavigate = (item: string) => {
    if (item === "add-account") {
      setShowConnectModal(true);
    } else {
      setActiveNav(item);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="ml-64">
        <Header />

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <StatsOverview />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EngagementChart 
                title="Weekly Performance" 
                subtitle="Tracking followers, engagement & likes"
              />
            </div>
            <BestTimeToPost />
          </div>

          {/* Accounts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
                <p className="text-sm text-muted-foreground">Manage and monitor your Instagram profiles</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {mockAccounts.map((account) => (
                <AccountCard 
                  key={account.username} 
                  {...account}
                />
              ))}
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SchedulePreview />
            <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">AI Content Insights</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Get AI-powered recommendations for captions, hashtags, and optimal posting strategies
              </p>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Explore AI Features →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Connect Account Modal */}
      <ConnectAccountModal 
        isOpen={showConnectModal} 
        onClose={() => setShowConnectModal(false)} 
      />
    </div>
  );
};

export default Index;
