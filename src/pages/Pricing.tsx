import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Sparkles, Building2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const calculatePrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
      return annualPrice.toFixed(2);
    }
    return monthlyPrice.toFixed(2);
  };

  const calculateMonthlyEquivalent = (monthlyPrice: number) => {
    if (isAnnual) {
      return (monthlyPrice * 0.8).toFixed(2);
    }
    return monthlyPrice.toFixed(2);
  };

  const handleCheckout = async (
    priceId: string,
    mode: 'subscription' | 'payment',
    planName: string,
    platform: 'finance' | 'business' | 'investor'
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

  const tiers = [
    {
      name: "Basic",
      description: "Perfect for getting started",
      monthlyPrice: 39.99,
      investorPrice: 12.99,
      stripePriceId: isAnnual ? "price_1SR1idKj5iDjtHZwymZ2NX9I" : "price_1SR1huKj5iDjtHZwSEDU4CHd",
      investorMonthlyPriceId: "price_basic_investor_monthly",
      investorAnnualPriceId: "price_basic_investor_annual",
      features: [
        "Core platform features",
        "Up to 5 team members",
        "Basic analytics",
        "Email support",
        "Mobile app access",
        "Standard security",
      ],
      gradient: "from-blue-500 to-cyan-500",
      icon: Sparkles,
    },
    {
      name: "Pro",
      description: "For growing teams",
      monthlyPrice: 72.99,
      investorPrice: 23.99,
      stripePriceId: isAnnual ? "price_1SR1jDKj5iDjtHZwJ1OP209L" : "price_1SR1isKj5iDjtHZwiiP9YxA4",
      investorMonthlyPriceId: "price_pro_investor_monthly",
      investorAnnualPriceId: "price_pro_investor_annual",
      features: [
        "All Basic features",
        "Up to 20 team members",
        "Advanced analytics & reports",
        "Priority support",
        "Custom integrations",
        "Advanced security & compliance",
        "API access",
        "Custom workflows",
      ],
      gradient: "from-purple-500 to-pink-500",
      icon: TrendingUp,
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 104.99,
      investorPrice: 41.99,
      stripePriceId: isAnnual ? "price_1SR1k7Kj5iDjtHZwTOYaYKXr" : "price_1SR1jjKj5iDjtHZw0NVFE780",
      investorMonthlyPriceId: "price_enterprise_investor_monthly",
      investorAnnualPriceId: "price_enterprise_investor_annual",
      features: [
        "All Pro features",
        "Unlimited team members",
        "White-label options",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom SLA",
        "Advanced security suite",
        "On-premise deployment option",
        "Custom training & onboarding",
      ],
      gradient: "from-orange-500 to-red-500",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 gap-2 bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Flexible pricing for both FlowPulse Finance and Business platforms
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing-toggle" className={`text-lg ${!isAnnual ? 'font-bold text-primary' : ''}`}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className={`text-lg ${isAnnual ? 'font-bold text-primary' : ''}`}>
              Annual
            </Label>
            {isAnnual && (
              <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="finance" className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="finance" className="text-lg">
              FlowPulse Finance
            </TabsTrigger>
            <TabsTrigger value="business" className="text-lg">
              FlowPulse Business
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2 text-primary">FlowPulse Finance</h2>
              <p className="text-muted-foreground">Comprehensive financial planning and wealth management</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <Card
                  key={`finance-${tier.name}`}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    tier.popular ? 'border-primary border-2 shadow-lg' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.gradient}`} />
                  
                  <CardHeader className="pt-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${tier.gradient} flex items-center justify-center mb-4`}>
                      <tier.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">£{calculateMonthlyEquivalent(tier.monthlyPrice)}</span>
                        <span className="text-muted-foreground">/{isAnnual ? 'month' : 'month'}</span>
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Billed annually at £{calculatePrice(tier.monthlyPrice)}
                        </p>
                      )}
                      {!isAnnual && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Billed monthly
                        </p>
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
                    <Button
                      className={`w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white border-0`}
                      size="lg"
                      onClick={() => handleCheckout(
                        tier.stripePriceId,
                        'subscription',
                        tier.name,
                        'finance'
                      )}
                      disabled={loading === `finance-${tier.name}`}
                    >
                      {loading === `finance-${tier.name}` ? 'Loading...' : 'Get Started'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(142, 76%, 36%)' }}>FlowPulse Business</h2>
              <p className="text-muted-foreground">Complete business management and operations platform</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <Card
                  key={`business-${tier.name}`}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    tier.popular ? 'border-2 shadow-lg' : ''
                  }`}
                  style={tier.popular ? { borderColor: 'hsl(142, 76%, 36%)' } : {}}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg" style={{ background: 'linear-gradient(to right, hsl(142, 76%, 36%), hsl(142, 70%, 45%))' }}>
                      Most Popular
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(to right, hsl(142, 76%, 36%), hsl(142, 70%, 45%))` }} />
                  
                  <CardHeader className="pt-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to right, hsl(142, 76%, 36%), hsl(142, 70%, 45%))' }}>
                      <tier.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">£{calculateMonthlyEquivalent(tier.monthlyPrice)}</span>
                        <span className="text-muted-foreground">/{isAnnual ? 'month' : 'month'}</span>
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Billed annually at £{calculatePrice(tier.monthlyPrice)}
                        </p>
                      )}
                      {!isAnnual && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Billed monthly
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(to right, hsl(142, 76%, 36%), hsl(142, 70%, 45%))' }}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full text-white border-0 hover:opacity-90"
                      size="lg"
                      style={{ background: 'linear-gradient(to right, hsl(142, 76%, 36%), hsl(142, 70%, 45%))' }}
                      onClick={() => handleCheckout(
                        tier.stripePriceId,
                        'subscription',
                        tier.name,
                        'business'
                      )}
                      disabled={loading === `business-${tier.name}`}
                    >
                      {loading === `business-${tier.name}` ? 'Loading...' : 'Get Started'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            </TabsContent>

            <TabsContent value="investor" className="mt-8">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {tiers.map((tier) => (
                  <Card 
                    key={tier.name}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                      tier.name === "Pro" && "border-primary shadow-lg scale-105"
                    )}
                  >
                    {tier.name === "Pro" && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                        POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="text-base">{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">
                            £{isAnnual ? calculateMonthlyEquivalent(tier.investorPrice) : tier.investorPrice}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {isAnnual && (
                          <p className="text-sm text-muted-foreground">
                            £{calculatePrice(tier.investorPrice)} billed annually (save 17%)
                          </p>
                        )}
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        variant={tier.name === "Pro" ? "default" : "outline"}
                        onClick={() => handleCheckout(
                          isAnnual ? tier.investorAnnualPriceId : tier.investorMonthlyPriceId,
                          'subscription',
                          tier.name,
                          'investor'
                        )}
                        disabled={loading === `investor-${tier.name}`}
                      >
                        {loading === `investor-${tier.name}` ? "Processing..." : "Get Started"}
                      </Button>

                      <div className="space-y-3 pt-4 border-t">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Need a Custom Plan?</CardTitle>
              <CardDescription className="text-base">
                Contact our sales team for custom enterprise solutions tailored to your organization's needs
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
