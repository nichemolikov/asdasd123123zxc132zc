import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Clock, 
  Bell, 
  TrendingUp,
  Check,
  Instagram,
  ArrowRight,
  Users,
  Zap
} from "lucide-react";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);
  const scrollToDemo = () => {
    const element = document.getElementById("demo");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: LayoutDashboard,
      title: "Multi-account dashboard",
      description: "Manage all your Instagram accounts from one unified dashboard with real-time insights."
    },
    {
      icon: Calendar,
      title: "Smart scheduler",
      description: "Schedule posts in advance with optimal timing recommendations based on your audience."
    },
    {
      icon: BarChart3,
      title: "Growth & engagement analytics",
      description: "Track followers, engagement rates, and performance metrics across all your accounts."
    },
    {
      icon: Clock,
      title: "Best time to post suggestions",
      description: "AI-powered recommendations for when your audience is most active and engaged."
    },
    {
      icon: Bell,
      title: "Alerts & growth warnings",
      description: "Get notified about engagement drops, posting frequency issues, and growth opportunities."
    },
    {
      icon: TrendingUp,
      title: "Performance insights",
      description: "Deep dive into what content performs best and optimize your strategy accordingly."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 Instagram account",
        "10 scheduled posts/month",
        "Basic analytics",
        "Email support"
      ],
      cta: "Get started",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing creators and businesses",
      features: [
        "5 Instagram accounts",
        "Unlimited scheduled posts",
        "Advanced analytics & insights",
        "Best time to post AI",
        "Priority support",
        "Team collaboration (3 members)"
      ],
      cta: "Get started",
      popular: true
    },
    {
      name: "Agency",
      price: "$99",
      period: "per month",
      description: "For agencies managing multiple clients",
      features: [
        "Unlimited Instagram accounts",
        "Unlimited scheduled posts",
        "White-label reports",
        "Advanced team management",
        "API access",
        "Dedicated account manager",
        "Custom integrations"
      ],
      cta: "Get started",
      popular: false
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Sign up",
      description: "Create your free account in seconds. No credit card required."
    },
    {
      number: "2",
      title: "Connect accounts",
      description: "Link your Instagram accounts securely with our OAuth integration."
    },
    {
      number: "3",
      title: "Schedule & grow",
      description: "Start scheduling posts and watch your analytics grow in real-time."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">InstaCommand</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button variant="gradient">Start free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Manage all your Instagram accounts from one{" "}
            <span className="gradient-text">powerful dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Multi-account management, scheduling, and analytics for Instagram. 
            Everything you need to grow your presence, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="xl" variant="gradient" className="w-full sm:w-auto">
                Start free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="xl" variant="outline" onClick={scrollToDemo} className="w-full sm:w-auto">
              View demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you manage, grow, and optimize your Instagram presence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl gradient-instagram flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Dashboard Section */}
      <section id="demo" className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">See it in action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a preview of what your dashboard will look like
          </p>
        </div>
        <div className="max-w-6xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Interactive dashboard preview</p>
              <p className="text-sm text-muted-foreground mt-2">
                Sign up to access your full dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card border rounded-2xl p-8 relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block">
                <Button
                  variant={plan.popular ? "gradient" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full gradient-instagram flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">InstaCommand</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The all-in-one platform for managing your Instagram presence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} InstaCommand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

