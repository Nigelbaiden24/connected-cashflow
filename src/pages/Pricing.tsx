import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Users, Building2, TrendingUp, Shield, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (
    priceId: string,
    mode: 'subscription' | 'payment',
    planName: string,
    platform: 'investor' | 'business'
  ) => {
    setLoading(`${platform}-${planName}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: priceId,
          mode: mode,
          planName: planName,
          platform: platform,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleContactSales = () => {
    toast({
      title: "Contact Sales",
      description: "Our team will be in touch shortly to discuss your custom requirements.",
    });
  };

  // FlowPulse Investor - Single annual tier
  const investorPlan = {
    name: "FlowPulse Investor",
    description: "Complete research, analysis & insights for self-directed investors",
    annualPrice: 1049,
    stripePriceId: "price_investor_annual", // Replace with actual Stripe price ID
    features: [
      "Market news & commentary",
      "Advanced stock screeners & filters",
      "AI analyst Q&A access",
      "Educational learning hub",
      "Unlimited watchlists",
      "Real-time signals & alerts",
      "Full research reports access",
      "Model portfolio insights",
      "Fund & ETF database",
      "Priority support",
      "Exclusive analyst picks",
      "Risk & scenario analysis tools",
    ],
    gradient: "from-violet-600 to-purple-600",
    icon: TrendingUp,
  };

  // FlowPulse Business - Team pricing tiers
  const businessTiers = [
    {
      name: "Team of 3",
      description: "Perfect for small advisory teams",
      annualPrice: 3597,
      seats: 3,
      stripePriceId: "price_business_3_seats", // Replace with actual Stripe price ID
      features: [
        "All Investor features included",
        "3 team member seats",
        "Shared client portfolio management",
        "Team collaboration tools",
        "Compliance reporting dashboard",
        "CRM integration",
        "Custom report generation",
        "Email support",
      ],
      gradient: "from-blue-600 to-cyan-600",
      icon: Users,
    },
    {
      name: "Team of 5",
      description: "Best value for growing practices",
      annualPrice: 5876,
      originalPrice: 7345,
      seats: 5,
      stripePriceId: "price_business_5_seats", // Replace with actual Stripe price ID
      features: [
        "All Investor features included",
        "5 team member seats",
        "Shared client portfolio management",
        "Team collaboration tools",
        "Compliance reporting dashboard",
        "Advanced CRM integration",
        "Custom report generation",
        "White-label client portal",
        "Priority support",
        "Dedicated account manager",
      ],
      gradient: "from-emerald-600 to-teal-600",
      icon: Building2,
      popular: true,
      discount: 20,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      annualPrice: null,
      seats: "Custom",
      stripePriceId: null,
      features: [
        "All Team of 5 features",
        "Unlimited team seats",
        "Custom API integrations",
        "Regulatory compliance suite",
        "24/7 priority support",
        "Custom training & onboarding",
        "Dedicated success manager",
        "SLA guarantees",
        "Custom security requirements",
      ],
      gradient: "from-orange-600 to-red-600",
      icon: Shield,
      isEnterprise: true,
    },
  ];

  // Payment partner logos - using text representations for authenticity
  const paymentPartners = [
    { name: "Visa", color: "text-blue-600" },
    { name: "Mastercard", color: "text-red-500" },
    { name: "American Express", color: "text-blue-500" },
    { name: "Stripe", color: "text-purple-600" },
    { name: "Apple Pay", color: "text-gray-800 dark:text-gray-200" },
    { name: "Google Pay", color: "text-gray-700 dark:text-gray-300" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 gap-2 bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Annual plans with full access to powerful investment tools
          </p>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm px-4 py-1">
            Annual Billing • Best Value
          </Badge>
        </div>

        <Tabs defaultValue="investor" className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-8 h-auto">
            <TabsTrigger value="investor" className="text-base md:text-lg py-3 px-4">
              FlowPulse Investor
            </TabsTrigger>
            <TabsTrigger value="business" className="text-base md:text-lg py-3 px-4">
              FlowPulse Business
            </TabsTrigger>
          </TabsList>

          {/* FlowPulse Investor Tab */}
          <TabsContent value="investor">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(270, 76%, 56%)' }}>
                FlowPulse Investor
              </h2>
              <p className="text-muted-foreground">
                Professional-grade research for individual investors
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-violet-500/30">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${investorPlan.gradient}`} />
                
                <CardHeader className="pt-8 text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${investorPlan.gradient} flex items-center justify-center mb-4 mx-auto`}>
                    <investorPlan.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl">{investorPlan.name}</CardTitle>
                  <CardDescription className="text-base">{investorPlan.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-8">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">£{investorPlan.annualPrice.toLocaleString()}</span>
                      <span className="text-muted-foreground text-lg">/year</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      That's just £{Math.round(investorPlan.annualPrice / 12)}/month
                    </p>
                  </div>

                  <ul className="space-y-3 text-left max-w-md mx-auto">
                    {investorPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`rounded-full p-1 bg-gradient-to-r ${investorPlan.gradient} flex-shrink-0 mt-0.5`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-8">
                  <Button
                    className={`w-full bg-gradient-to-r ${investorPlan.gradient} hover:opacity-90 text-white border-0 text-lg py-6`}
                    size="lg"
                    onClick={() => handleCheckout(
                      investorPlan.stripePriceId,
                      'subscription',
                      investorPlan.name,
                      'investor'
                    )}
                    disabled={loading === `investor-${investorPlan.name}`}
                  >
                    {loading === `investor-${investorPlan.name}` ? 'Loading...' : 'Get Started Now'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* FlowPulse Business Tab */}
          <TabsContent value="business">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2 text-primary">FlowPulse Business</h2>
              <p className="text-muted-foreground">
                Team solutions for financial advisors and wealth managers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {businessTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    tier.popular ? 'border-primary border-2 shadow-lg' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                      Best Value
                    </div>
                  )}
                  {tier.discount && (
                    <Badge className="absolute top-12 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      Save {tier.discount}%
                    </Badge>
                  )}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.gradient}`} />
                  
                  <CardHeader className="pt-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${tier.gradient} flex items-center justify-center mb-4`}>
                      <tier.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      {typeof tier.seats === 'number' ? `${tier.seats} seats included` : tier.seats}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      {tier.annualPrice ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">£{tier.annualPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground">/year</span>
                          </div>
                          {tier.originalPrice && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="line-through">£{tier.originalPrice.toLocaleString()}</span>
                              <span className="ml-2 text-green-600 font-medium">You save £{(tier.originalPrice - tier.annualPrice).toLocaleString()}</span>
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            £{typeof tier.seats === 'number' ? Math.round(tier.annualPrice / tier.seats / 12) : 0}/seat/month
                          </p>
                        </>
                      ) : (
                        <div className="text-3xl font-bold text-primary">Custom Pricing</div>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className={`rounded-full p-1 bg-gradient-to-r ${tier.gradient} flex-shrink-0 mt-0.5`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    {tier.isEnterprise ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white border-0`}
                        size="lg"
                        onClick={handleContactSales}
                      >
                        Contact Sales
                      </Button>
                    ) : (
                      <Button
                        className={`w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white border-0`}
                        size="lg"
                        onClick={() => handleCheckout(
                          tier.stripePriceId!,
                          'subscription',
                          tier.name,
                          'business'
                        )}
                        disabled={loading === `business-${tier.name}`}
                      >
                        {loading === `business-${tier.name}` ? 'Loading...' : 'Get Started'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Trusted Payment Partners Section */}
        <div className="mt-16 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Secure Payments Powered By
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4 py-6 bg-muted/30 rounded-xl border">
            {/* Visa */}
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded italic">
                VISA
              </div>
            </div>
            
            {/* Mastercard */}
            <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <div className="w-6 h-6 bg-orange-400 rounded-full -ml-3"></div>
              <span className="ml-1 font-semibold text-sm">mastercard</span>
            </div>
            
            {/* American Express */}
            <div className="opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-blue-500 text-white font-bold text-xs px-2 py-2 rounded">
                AMERICAN EXPRESS
              </div>
            </div>
            
            {/* Stripe */}
            <div className="opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-purple-600 font-bold text-xl">stripe</span>
            </div>
            
            {/* Apple Pay */}
            <div className="opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                <span className="text-xl">🍎</span>
                <span className="font-semibold">Pay</span>
              </div>
            </div>
            
            {/* Google Pay */}
            <div className="opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-0.5">
                <span className="text-blue-500 font-bold">G</span>
                <span className="text-red-500 font-bold">o</span>
                <span className="text-yellow-500 font-bold">o</span>
                <span className="text-blue-500 font-bold">g</span>
                <span className="text-green-500 font-bold">l</span>
                <span className="text-red-500 font-bold">e</span>
                <span className="ml-1 font-medium">Pay</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              256-bit SSL encryption • PCI DSS compliant • GDPR compliant
            </p>
          </div>
        </div>

        {/* Custom Plan CTA */}
        <div className="mt-8 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Need a Custom Solution?</CardTitle>
              <CardDescription className="text-base">
                Contact our enterprise team for tailored solutions, volume discounts, and custom integrations
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleContactSales}
              >
                Contact Enterprise Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
