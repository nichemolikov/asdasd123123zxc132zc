import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { SchedulePreview } from "@/components/dashboard/SchedulePreview";
import { BestTimeToPost } from "@/components/dashboard/BestTimeToPost";
import { ConnectAccountModal } from "@/components/modals/ConnectAccountModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstagramAccounts } from "@/hooks/useInstagramAccounts";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const { accounts, loading: accountsLoading, addAccount } = useInstagramAccounts();
  const { scheduledPosts, loading: postsLoading } = useScheduledPosts();
  const { stats, chartData } = useAnalytics(accounts);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleNavigate = (item: string) => {
    if (item === "add-account") {
      setShowConnectModal(true);
    } else {
      setActiveNav(item);
    }
  };

  const handleConnectAccount = async (username: string) => {
    return await addAccount(username);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="ml-64">
        <Header />

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <StatsOverview stats={stats} loading={accountsLoading} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EngagementChart 
                title="Weekly Performance" 
                subtitle="Tracking followers, engagement & likes"
                data={chartData}
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
            {accountsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div>
                        <div className="h-4 w-24 bg-muted rounded mb-1" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No accounts connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your first Instagram account to get started
                </p>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Connect Account →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {accounts.map((account) => (
                  <AccountCard 
                    key={account.id} 
                    username={account.username}
                    avatar={account.avatar_url || `https://ui-avatars.com/api/?name=${account.username}&background=random`}
                    followers={account.followers_count}
                    posts={account.posts_count}
                    totalLikes={account.total_likes}
                    avgLikes={Number(account.avg_likes_per_post)}
                    engagementRate={Number(account.engagement_rate)}
                    lastPostDate={account.last_synced_at ? new Date(account.last_synced_at).toLocaleDateString() : "Never"}
                    trend={Number(account.engagement_rate) > 5 ? "up" : Number(account.engagement_rate) > 3 ? "stable" : "down"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Schedule Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SchedulePreview scheduledPosts={scheduledPosts} loading={postsLoading} />
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
        onConnect={handleConnectAccount}
      />
    </div>
  );
};

export default Index;
