import { useState } from "react";
import { Instagram, X, Shield, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectAccountModal = ({ isOpen, onClose }: ConnectAccountModalProps) => {
  const [step, setStep] = useState<"choose" | "connecting" | "success">("choose");

  if (!isOpen) return null;

  const handleConnect = () => {
    setStep("connecting");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    setStep("choose");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {step === "choose" && (
          <>
            {/* Header */}
            <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
              <div className="absolute inset-0 gradient-instagram opacity-10" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-instagram flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Instagram className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground mb-2">Connect Instagram Account</h2>
                <p className="text-sm text-muted-foreground">
                  Link your Instagram Business or Creator account to start managing
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Secure OAuth Connection</p>
                  <p className="text-xs text-muted-foreground">We use Meta's official API for secure access</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Full Analytics Access</p>
                  <p className="text-xs text-muted-foreground">Get insights on followers, engagement & more</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 pb-6">
              <Button 
                variant="gradient" 
                size="xl" 
                className="w-full"
                onClick={handleConnect}
              >
                Continue with Instagram
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-instagram flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Instagram className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">Connecting...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we establish a secure connection
            </p>
            <div className="mt-6 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">Account Connected!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your Instagram account has been successfully linked
            </p>
            <Button onClick={handleClose} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
