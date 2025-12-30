import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Scheduler from "./pages/Scheduler";
import Accounts from "./pages/Accounts";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                }
              />
              {/* Redirect old index route to dashboard */}
              <Route
                path="/index"
                element={
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                }
              />
              <Route
                path="/scheduler"
                element={
                  <AuthenticatedLayout>
                    <Scheduler />
                  </AuthenticatedLayout>
                }
              />
              <Route
                path="/accounts"
                element={
                  <AuthenticatedLayout>
                    <Accounts />
                  </AuthenticatedLayout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AuthenticatedLayout>
                    <Analytics />
                  </AuthenticatedLayout>
                }
              />
              <Route
                path="/alerts"
                element={
                  <AuthenticatedLayout>
                    <Alerts />
                  </AuthenticatedLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                }
              />
              {/* Redirect root to dashboard if authenticated, otherwise landing */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
