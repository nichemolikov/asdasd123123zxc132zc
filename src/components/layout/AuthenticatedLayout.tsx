import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Set active nav based on current route
    const path = location.pathname;
    if (path === "/dashboard") {
      setActiveNav("dashboard");
    } else if (path === "/scheduler") {
      setActiveNav("schedule");
    } else if (path === "/accounts") {
      setActiveNav("accounts");
    } else if (path === "/analytics") {
      setActiveNav("analytics");
    } else if (path === "/alerts") {
      setActiveNav("alerts");
    } else if (path === "/settings") {
      setActiveNav("settings");
    }
  }, [location]);

  const handleNavigate = (item: string) => {
    if (item === "add-account") {
      navigate("/accounts");
      return;
    }
    
    setActiveNav(item);
    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      schedule: "/scheduler",
      accounts: "/accounts",
      analytics: "/analytics",
      alerts: "/alerts",
      settings: "/settings",
    };
    
    if (routes[item]) {
      navigate(routes[item]);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated - redirect handled by useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />
      <main className="ml-64">
        <Header />
        {children}
      </main>
    </div>
  );
};

