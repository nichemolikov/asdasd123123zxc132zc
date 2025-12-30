import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, TrendingDown, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "engagement_drop" | "posting_low" | "growth_spike";
  message: string;
  instagram_account_id: string | null;
  created_at: string;
  is_read: boolean;
  instagram_accounts?: {
    username: string;
  };
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  useEffect(() => {
    if (!workspace) {
      setLoading(false);
      return;
    }

    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from("alerts")
          .select(`
            *,
            instagram_accounts (
              username
            )
          `)
          .eq("workspace_id", workspace.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setAlerts(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching alerts",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [workspace]);

  const toggleRead = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    const newReadState = !alert.is_read;

    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: newReadState })
        .eq("id", id);

      if (error) throw error;

      setAlerts(alerts.map(a => 
        a.id === id ? { ...a, is_read: newReadState } : a
      ));
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "posting_low":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "engagement_drop":
        return <TrendingDown className="w-5 h-5 text-warning" />;
      case "growth_spike":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      posting_low: "destructive",
      engagement_drop: "default",
      growth_spike: "secondary",
    };
    const labels: Record<string, string> = {
      posting_low: "Posting Low",
      engagement_drop: "Engagement Drop",
      growth_spike: "Growth Spike",
    };
    return (
      <Badge variant={variants[type] || "outline"}>
        {labels[type] || type}
      </Badge>
    );
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Stay informed about your account performance and important updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-sm">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No alerts</h3>
          <p className="text-muted-foreground">
            You're all caught up! New alerts will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-6 transition-all ${
                !alert.is_read ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlertBadge(alert.type)}
                        {alert.instagram_accounts && (
                          <span className="text-sm font-medium text-muted-foreground">
                            @{alert.instagram_accounts.username}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(alert.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {alert.is_read ? "Read" : "Unread"}
                        </span>
                        <Switch
                          checked={alert.is_read}
                          onCheckedChange={() => toggleRead(alert.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;

