import { Bell, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left - Title & Breadcrumb */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening with your accounts.</p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
          </Button>

          {/* User Menu */}
          <button className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-secondary transition-colors">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="User"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
