import { useState } from "react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Shield, CreditCard, Lock, Globe, HeadphonesIcon, BarChart3, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(true);

  const ANNUAL_PRICE = 995;
  const MONTHLY_PRICE_MONTHLY = Math.round((ANNUAL_PRICE / 12) * 1.2); // 20% more expensive for monthly
  const MONTHLY_PRICE_YEARLY_EQUIVALENT = MONTHLY_PRICE_MONTHLY * 12;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const planName = billingAnnual ? "Annual" : "Monthly";
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planName, platform: 'investor', billingAnnual },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    toast({ title: "Contact Sales", description: "Our team will be in touch shortly to discuss your custom requirements." });
  };

  const trustMetrics = [
    { value: "£2.4B+", label: "Assets Tracked" },
    { value: "1,200+", label: "Advisory Firms" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "SOC 2", label: "Certified" },
  ];

  const features = [
    "Enterprise MFA security",
    "Real-time alerts",
    "Global market data",
    "AI-powered analysis",
    "Priority support",
    "Data encryption",
    "Unlimited reports",
    "Custom dashboards",
    "API access",
    "Team collaboration",
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 gap-2 bg-background/80 backdrop-blur-sm border border-border/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25 p-2">
            <img src={flowpulseLogo} alt="FlowPulse" className="w-full h-full object-contain rounded-md" />
          </div>
          <h1 className="text-4xl font-bold font-space-grotesk mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One plan. All features. No hidden fees.
          </p>
        </div>

        <Tabs defaultValue="investor" className="mb-16">
          <div className="flex justify-center mb-10">
            <TabsList className="inline-flex w-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/30">
              <TabsTrigger value="investor" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <img src={flowpulseLogo} alt="FlowPulse" className="h-5 w-5 mr-2 rounded-sm object-contain" />
                FlowPulse Investor
              </TabsTrigger>
              <TabsTrigger value="teams" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <Users className="h-4 w-4 mr-2" />
                Enterprise Teams
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ============ FlowPulse Investor Tab ============ */}
          <TabsContent value="investor">
            <div className="max-w-2xl mx-auto">
              <Card className="relative overflow-hidden border-primary/20 bg-card/90 backdrop-blur-sm shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                {/* Billing Toggle */}
                <div className="flex justify-center pt-8 pb-2">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${!billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                      Monthly
                    </span>
                    <Switch checked={billingAnnual} onCheckedChange={setBillingAnnual} />
                    <span className={`text-sm font-medium ${billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                      Annual
                    </span>
                  </div>
                </div>

                <CardHeader className="pt-4 pb-4 text-center">
                  <CardTitle className="text-xl font-space-grotesk">Complete Access</CardTitle>
                  <CardDescription className="text-sm">
                    Everything you need to track, analyse and act on opportunities
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8">
                  {/* Price Display */}
                  <div className="text-center py-6">
                    {billingAnnual ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-6xl font-bold font-space-grotesk text-foreground">£{ANNUAL_PRICE.toLocaleString()}</span>
                          <span className="text-xl text-muted-foreground">/year</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Save 20% with annual billing
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-6xl font-bold font-space-grotesk text-foreground">£{MONTHLY_PRICE_MONTHLY}</span>
                          <span className="text-xl text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="line-through">£{Math.round(ANNUAL_PRICE / 12)}</span>{" "}
                          <span className="text-warning">20% more expensive than annual</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          £{MONTHLY_PRICE_YEARLY_EQUIVALENT.toLocaleString()} billed annually equivalent
                        </p>
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 text-lg py-6 rounded-xl shadow-lg shadow-primary/20 font-semibold"
                    size="lg"
                    disabled={loading}
                    onClick={handleCheckout}
                  >
                    {loading ? 'Loading...' : billingAnnual ? `Get Started — £${ANNUAL_PRICE.toLocaleString()}/year` : `Get Started — £${MONTHLY_PRICE_MONTHLY}/month`}
                  </Button>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure checkout</span>
                    <span>•</span>
                    <span>14-day guarantee</span>
                    <span>•</span>
                    <span>Cancel anytime</span>
                  </div>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/30" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-widest">What's included</span>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/20 border border-border/20">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pb-8 px-8">
                  <p className="text-xs text-muted-foreground text-center w-full">
                    No hidden fees. No credit card required to start. Full access to all features.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* ============ Teams Tab ============ */}
          <TabsContent value="teams">
            <div className="max-w-4xl mx-auto">
              <Card className="relative overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="text-center pt-12 pb-8 px-8 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-5 mx-auto shadow-lg shadow-primary/25 p-3">
                    <img src={flowpulseLogo} alt="FlowPulse" className="w-full h-full object-contain rounded-md" />
                  </div>
                  <h2 className="text-3xl font-bold font-space-grotesk mb-2">Enterprise Teams</h2>
                  <p className="text-muted-foreground text-lg mb-6">Custom quotation for your organisation</p>
                  <div className="text-5xl font-bold font-space-grotesk text-primary mb-1">Contact Us</div>
                  <p className="text-sm text-muted-foreground">Tailored to your team size & requirements</p>
                </div>
                <CardContent className="px-8 pb-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      "Create & manage organisations",
                      "Invite unlimited team members",
                      "Role-based access control",
                      "Shared workflows & analytics",
                      "Shared cost tracking",
                      "Shared integrations",
                      "Organisation-scoped data isolation",
                      "Admin dashboard & controls",
                      "Ownership transfer",
                      "Priority enterprise support",
                      "Custom onboarding",
                      "SLA guarantees",
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/20 border border-border/20">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-8 flex-col gap-3">
                  <Button
                    className="w-full max-w-md mx-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 text-lg py-6 rounded-xl shadow-lg shadow-primary/20 font-semibold"
                    size="lg"
                    onClick={handleContactSales}
                  >
                    Contact Us for Custom Quotation
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Our team will get back to you within 24 hours
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Trust metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustMetrics.map((m, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-card/40 border border-border/20">
              <p className="text-2xl font-bold font-space-grotesk text-primary">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Payment Partners */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
              <CreditCard className="h-3.5 w-3.5" />
              Secure Payments Powered By
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-6 py-5 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20">
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <div className="bg-primary text-primary-foreground font-bold text-lg px-3 py-1 rounded italic">VISA</div>
            </div>
            <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 bg-destructive rounded-full" />
              <div className="w-5 h-5 bg-warning rounded-full -ml-2.5" />
              <span className="ml-1 font-semibold text-xs text-muted-foreground">mastercard</span>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <div className="bg-primary text-primary-foreground font-bold text-[10px] px-2 py-1.5 rounded">AMERICAN EXPRESS</div>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-primary font-bold text-lg">stripe</span>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-opacity text-muted-foreground font-semibold text-sm">
              Apple Pay
            </div>
            <div className="opacity-50 hover:opacity-100 transition-opacity text-muted-foreground font-semibold text-sm">
              Google Pay
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              256-bit SSL encryption · PCI DSS compliant · GDPR compliant
            </p>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center pb-16">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-border/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-space-grotesk">Need a Custom Solution?</CardTitle>
              <CardDescription className="text-base">
                Volume discounts, custom integrations & dedicated account management
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-8">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl px-8"
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
