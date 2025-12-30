import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConnectAccountModal } from "@/components/modals/ConnectAccountModal";
import { useInstagramAccounts } from "@/hooks/useInstagramAccounts";
import { BestTimeToPost } from "@/components/dashboard/BestTimeToPost";
import { Plus, Users, TrendingUp, Calendar, Heart } from "lucide-react";
import { format } from "date-fns";

const Accounts = () => {
  const { accounts, loading, addAccount } = useInstagramAccounts();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleConnectAccount = async (username: string) => {
    return await addAccount(username);
  };

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  const getEngagementScore = (rate: number) => {
    if (rate >= 5) return { label: "Excellent", color: "bg-success text-success-foreground" };
    if (rate >= 3) return { label: "Good", color: "bg-warning text-warning-foreground" };
    return { label: "Needs Improvement", color: "bg-destructive text-destructive-foreground" };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your connected Instagram accounts</p>
        </div>
        <Button variant="gradient" onClick={() => setShowConnectModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Connect Instagram Account
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first Instagram account to get started
          </p>
          <Button variant="gradient" onClick={() => setShowConnectModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accounts List */}
          <div className="lg:col-span-2 space-y-4">
            {accounts.map((account) => {
              const score = getEngagementScore(Number(account.engagement_rate));
              return (
                <Card
                  key={account.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedAccount === account.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedAccount(account.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={account.avatar_url || `https://ui-avatars.com/api/?name=${account.username}&background=random`}
                        alt={account.username}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">@{account.username}</h3>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Connected {account.last_synced_at ? format(new Date(account.last_synced_at), "MMM d, yyyy") : "Recently"}
                        </p>
                      </div>
                    </div>
                    <Badge className={score.color}>{score.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span>Followers</span>
                      </div>
                      <p className="text-xl font-semibold">
                        {account.followers_count.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posts</span>
                      </div>
                      <p className="text-xl font-semibold">
                        {account.posts_count.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Engagement</span>
                      </div>
                      <p className="text-xl font-semibold">
                        {Number(account.engagement_rate).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Account Detail Sidebar */}
          <div className="lg:col-span-1">
            {selectedAccountData ? (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Username</p>
                      <p className="font-medium">@{selectedAccountData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Followers</p>
                      <p className="font-medium">{selectedAccountData.followers_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                      <p className="font-medium">{selectedAccountData.posts_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                      <p className="font-medium">{Number(selectedAccountData.engagement_rate).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Likes</p>
                      <p className="font-medium">{selectedAccountData.total_likes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Likes/Post</p>
                      <p className="font-medium">{Number(selectedAccountData.avg_likes_per_post).toFixed(0)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Best Time to Post</h3>
                  <BestTimeToPost />
                </Card>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Select an account to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}

      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnectAccount}
      />
    </div>
  );
};

export default Accounts;

