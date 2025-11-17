import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Globe, 
  TrendingUp, 
  Building, 
  Gem, 
  Brain,
  Shield, 
  Sparkles,
  Search,
  LineChart,
  FileText,
  CheckCircle2,
  Calculator,
  BookOpen,
  Eye
} from "lucide-react";
import investorScreenshot from "@/assets/investor-dashboard-screenshot.png";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const InvestorFeatures = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Research & Analysis",
      description: "Access exclusive research reports, market analysis, and investment intelligence from global markets. Get insights on international stocks, crypto, real estate, and alternative investments."
    },
    {
      icon: Brain,
      title: "AI-Powered Analyst",
      description: "Leverage advanced AI to analyze portfolios, predict market trends, and receive personalized investment recommendations. Your intelligent assistant for smarter investment decisions."
    },
    {
      icon: LineChart,
      title: "Market Commentary",
      description: "Stay informed with expert market commentary, sentiment analysis, and real-time insights. Understand market movements and make informed decisions."
    },
    {
      icon: Search,
      title: "Screeners & Discovery",
      description: "Discover investment opportunities across international stocks, cryptocurrency, real estate, precious metals, and private equity with powerful screening tools."
    },
    {
      icon: Shield,
      title: "Risk & Compliance",
      description: "Monitor risk exposure, maintain regulatory compliance, and access comprehensive risk management tools. Stay compliant with international regulations."
    },
    {
      icon: TrendingUp,
      title: "Signals & Alerts",
      description: "Receive real-time market signals, price alerts, and investment opportunities. Never miss important market movements or trading opportunities."
    },
    {
      icon: Calculator,
      title: "Tools & Calculators",
      description: "Access professional-grade financial calculators for returns, risk analysis, retirement planning, and portfolio optimization."
    },
    {
      icon: BookOpen,
      title: "Learning Hub",
      description: "Expand your investment knowledge with courses, videos, articles, and certifications covering international markets and investment strategies."
    },
    {
      icon: Eye,
      title: "Watchlists",
      description: "Track and monitor your favorite investments across all asset classes. Create custom watchlists and receive performance updates."
    },
    {
      icon: Globe,
      title: "International Markets",
      description: "Access global stock markets, emerging markets, and international investment opportunities. Invest without borders."
    },
    {
      icon: Gem,
      title: "Alternative Assets",
      description: "Explore precious metals, gemstones, real estate, land, and private equity opportunities. Diversify beyond traditional investments."
    },
    {
      icon: Sparkles,
      title: "Model Portfolios",
      description: "Access professionally designed model portfolios tailored to different risk profiles and investment objectives. Copy proven strategies."
    }
  ];

  const benefits = [
    "Access exclusive global investment opportunities",
    "AI-powered insights for smarter decisions",
    "Diversify across international markets",
    "Professional research and analysis tools",
    "Real-time market data and alerts",
    "Educational resources and certifications"
  ];

  const assetClasses = [
    {
      icon: Globe,
      title: "International Stocks",
      description: "Global equities across developed and emerging markets"
    },
    {
      icon: TrendingUp,
      title: "Cryptocurrency",
      description: "Digital assets and blockchain investments"
    },
    {
      icon: Building,
      title: "Real Estate & Land",
      description: "International property and land opportunities"
    },
    {
      icon: Gem,
      title: "Precious Metals & Gemstones",
      description: "Gold, silver, platinum, diamonds, and rare gems"
    },
    {
      icon: Building,
      title: "Private Equity",
      description: "Businesses for sale and private investments"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={flowpulseLogo} alt="FlowPulse" className="h-12 w-12" />
                <h1 className="text-5xl font-bold">FlowPulse Investor</h1>
              </div>
              <p className="text-xl text-purple-100">
                Your gateway to global investment opportunities. Access exclusive research, AI-powered insights, and international markets.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => navigate('/login-investor')}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
              <img 
                src={investorScreenshot} 
                alt="FlowPulse Investor Platform" 
                className="relative rounded-lg shadow-2xl border-2 border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Asset Classes */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Investment Focus Areas</h2>
            <p className="text-muted-foreground">Access diverse asset classes and global opportunities</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {assetClasses.map((asset, index) => (
              <Card key={index}>
                <CardHeader>
                  <asset.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{asset.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{asset.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground">Everything you need for global investing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose FlowPulse Investor?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/login-investor')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Start Investing Today
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorFeatures;
