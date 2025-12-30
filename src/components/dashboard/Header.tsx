import { Bell, Search, ChevronDown, LogOut, Instagram } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/scheduler") return "Scheduler";
    if (path === "/accounts") return "Accounts";
    if (path === "/analytics") return "Analytics";
    if (path === "/alerts") return "Alerts";
    if (path === "/settings") return "Settings";
    return "Dashboard";
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Welcome back! Here's what's happening with your accounts.";
    if (path === "/scheduler") return "Schedule and manage your Instagram posts";
    if (path === "/accounts") return "Manage your connected Instagram accounts";
    if (path === "/analytics") return "Track performance and engagement across your accounts";
    if (path === "/alerts") return "Stay informed about your account performance";
    if (path === "/settings") return "Manage your workspace, billing, and team";
    return "Welcome back!";
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left - Title & Breadcrumb */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
          <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Connect Instagram Button */}
          <Button
            variant="outline"
            className="hidden md:flex gap-2"
            onClick={() => navigate("/accounts")}
          >
            <Instagram className="w-4 h-4" />
            Connect Instagram
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accounts, posts..."
              className="w-64 h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/alerts")}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-secondary transition-colors">
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">My Workspace</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
