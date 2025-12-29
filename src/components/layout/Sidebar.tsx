import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  PlusCircle,
  Instagram,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Users },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ activeItem, onNavigate }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center shadow-glow">
          <Instagram className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">InstaFlow</h1>
          <p className="text-xs text-sidebar-foreground/60">Management Suite</p>
        </div>
      </div>

      {/* Add Account Button */}
      <div className="px-4 py-4">
        <Button 
          variant="gradient" 
          className="w-full justify-start gap-2"
          onClick={() => onNavigate("add-account")}
        >
          <PlusCircle className="w-4 h-4" />
          Connect Account
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeItem === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {item.id === "insights" && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                NEW
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="mx-4 mb-4 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-xs font-medium text-sidebar-foreground">This Week</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-foreground/60">Followers</span>
            <span className="text-xs font-semibold text-success">+2.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-foreground/60">Engagement</span>
            <span className="text-xs font-semibold text-success">+5.1%</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeItem === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
