import { useState } from "react";
import { Instagram, X, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (username: string) => Promise<any>;
}

export const ConnectAccountModal = ({ isOpen, onClose }: ConnectAccountModalProps) => {
  const [loading, setLoading] = useState(false);
  const { workspace } = useWorkspace();

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    
    if (!appId) {
      console.error("VITE_FACEBOOK_APP_ID is not set. Please configure Instagram API credentials.");
      alert("Instagram API not configured. Please set VITE_FACEBOOK_APP_ID in your .env file.");
      setLoading(false);
      return;
    }
    
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'instagram_content_publish',
      'pages_read_engagement',
      'pages_show_list'
    ].join(',');
    
    // Generate random state for security
    const state = crypto.randomUUID();
    localStorage.setItem('instagram_oauth_state', state);
    
    // Store workspace ID if available
    if (workspace?.id) {
      localStorage.setItem('instagram_workspace_id', workspace.id);
    } else {
      console.warn('No workspace found. User may need to sign up first.');
    }
    
    // Redirect to Facebook OAuth (Instagram Graph API)
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes}` +
      `&response_type=code` +
      `&state=${state}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
          <div className="absolute inset-0 gradient-instagram opacity-10" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-instagram flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Instagram className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">Connect Instagram Account</h2>
            <p className="text-sm text-muted-foreground">
              Link your Instagram Business or Creator account.
            </p>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-left">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Before you connect:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Ensure your Instagram account is switched to <strong>Professional</strong> (Business or Creator).</li>
                        <li>You do <strong>not</strong> need to link a Facebook Page.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Secure OAuth Connection</p>
              <p className="text-xs text-muted-foreground">We use official Instagram API</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <Button 
            className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
            variant="gradient"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Connect with Instagram"}
          </Button>
        </div>
      </div>
    </div>
  );
};
