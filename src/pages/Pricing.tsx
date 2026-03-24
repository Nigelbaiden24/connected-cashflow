import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Users, Building2, TrendingUp, Shield, CreditCard, Plus, Minus, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [seatCount, setSeatCount] = useState(3);

  const handleCheckout = async (
    priceId: string,
    mode: 'subscription' | 'payment',
    planName: string,
    platform: 'investor' | 'finance'
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

  // Investment opportunity products available to choose from
  const investmentProducts = [
    { id: "stocks", name: "Stocks & Equities", description: "Listed equities, IPOs & secondary offerings" },
    { id: "crypto", name: "Crypto & Digital Assets", description: "Cryptocurrency and blockchain investments" },
    { id: "real-estate", name: "Real Estate", description: "Commercial & residential property deals" },
    { id: "private-equity", name: "Private Equity", description: "PE deals, buyouts & growth capital" },
    { id: "venture-capital", name: "Venture Capital", description: "Early-stage & startup funding rounds" },
    { id: "fixed-income", name: "Fixed Income & Bonds", description: "Government & corporate bonds" },
    { id: "commodities", name: "Commodities", description: "Gold, oil, agriculture & natural resources" },
    { id: "forex", name: "Foreign Exchange", description: "FX opportunities & currency markets" },
    { id: "funds-etfs", name: "Funds & ETFs", description: "Fund analysis, scoring & selection" },
    { id: "alternatives", name: "Alternative Investments", description: "Hedge funds, art, wine & collectibles" },
    { id: "infrastructure", name: "Infrastructure", description: "Energy, transport & utilities projects" },
    { id: "sme-acquisitions", name: "SME Acquisitions", description: "Small & medium business buy-side deals" },
    { id: "debt-lending", name: "Debt & Lending", description: "Private credit, bridging & mezzanine finance" },
    { id: "esg-impact", name: "ESG & Impact Investing", description: "Sustainable & socially responsible opportunities" },
    { id: "distressed", name: "Distressed Assets", description: "Turnarounds, workouts & special situations" },
  ];

  const SEAT_PRICE = 100;
  const MIN_SEATS = 3;
  const INCLUDED_PRODUCTS = 3;
  const ADDON_PRICE = 1200;

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addonCount = Math.max(0, selectedProducts.length - INCLUDED_PRODUCTS);
  const seatTotal = seatCount * SEAT_PRICE;
  const addonTotal = addonCount * ADDON_PRICE;
  const totalPrice = seatTotal + addonTotal;


  // Jenrate / Document Generator - Tiered plans
  const jenrateTiers = [
    {
      name: "Basic",
      description: "Get started with document generation for free",
      monthlyPrice: 0,
      stripePriceId: null,
      isFree: true,
      features: [
        "Up to 5 documents/month",
        "Basic templates",
        "PDF export",
        "Standard formatting",
      ],
      gradient: "from-amber-500 to-orange-500",
      icon: TrendingUp,
    },
    {
      name: "Pro",
      description: "Professional document generation at scale",
      monthlyPrice: 9,
      stripePriceId: "price_jenrate_pro",
      features: [
        "Everything in Basic",
        "Unlimited documents",
        "Custom templates & branding",
        "Drag & drop builder",
        "Image & shape tools",
        "Multi-page documents",
        "Priority rendering",
        "Priority support",
      ],
      gradient: "from-orange-500 to-red-500",
      icon: Building2,
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Advanced document automation for teams",
      monthlyPrice: 17,
      stripePriceId: "price_jenrate_enterprise",
      features: [
        "Everything in Pro",
        "API access for automation",
        "Batch document generation",
        "Team collaboration",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantees",
        "Audit trail & compliance",
      ],
      gradient: "from-red-500 to-rose-600",
      icon: Shield,
    },
  ];

  // FlowPulse Finance - Team pricing tiers
  const financeTiers = [
    {
      name: "Team of 3",
      description: "Perfect for small advisory teams",
      annualPrice: 3597,
      seats: 3,
      stripePriceId: "price_finance_3_seats", // Replace with actual Stripe price ID
      features: [
        "Deal alerts & notifications",
        "Unlimited watchlists",
        "Market commentary access",
        "Basic screeners & discovery",
        "Company/deal database",
        "Featured analyst picks",
        "Opportunities intelligence",
        "3 team member seats",
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
      stripePriceId: "price_finance_5_seats", // Replace with actual Stripe price ID
      features: [
        "Deal alerts & notifications",
        "Unlimited watchlists",
        "Market commentary access",
        "Basic screeners & discovery",
        "Company/deal database",
        "Featured analyst picks",
        "Opportunities intelligence",
        "5 team member seats",
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
        "24/7 priority support",
        "Custom training & onboarding",
        "Dedicated success manager",
        "SLA guarantees",
      ],
      gradient: "from-orange-600 to-red-600",
      icon: Shield,
      isEnterprise: true,
    },
  ];

  // Add-on features
  const addOnFeatures = [
    { name: "Fund Scoring", description: "AI-powered fund analysis and scoring" },
    { name: "Advanced Screening & Discovery", description: "Enhanced filters and discovery tools" },
    { name: "Model Portfolios", description: "Pre-built investment strategies" },
    { name: "Predictive Analytics", description: "AI-driven market predictions" },
    { name: "Comprehensive Fund & ETF Database", description: "Extended fund coverage" },
    { name: "Stocks & Crypto Database", description: "Full equity and crypto coverage" },
    { name: "CRM Integration", description: "Customer relationship management" },
    { name: "API Access", description: "Programmatic data access" },
    { name: "Learning Hub", description: "Educational resources and training" },
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

        <Tabs defaultValue="finance" className="mb-12">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 mb-8 h-auto">
            <TabsTrigger value="finance" className="text-sm md:text-base py-3 px-3">
              FlowPulse Finance
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-sm md:text-base py-3 px-3">
              Teams
            </TabsTrigger>
          </TabsList>

          {/* FlowPulse Finance Tab - Modular Subscription Builder */}
          <TabsContent value="finance">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-primary">
                FlowPulse Finance
              </h2>
              <p className="text-muted-foreground mb-4">
                Build your personalised financial advisory package
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-sm px-4 py-1.5">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  £{SEAT_PRICE}/seat/year — minimum {MIN_SEATS} seats
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30 text-sm px-4 py-1.5">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  {INCLUDED_PRODUCTS} core products included
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add-on products: £{ADDON_PRICE.toLocaleString()}/year each
                </Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div className="lg:col-span-2">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Select Your Investment Products
                    </CardTitle>
                    <CardDescription>
                      Choose {INCLUDED_PRODUCTS} core products included in your subscription. Each additional product is £{ADDON_PRICE.toLocaleString()}/year.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {investmentProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        const selectionIndex = selectedProducts.indexOf(product.id);
                        const isAddon = selectionIndex >= INCLUDED_PRODUCTS;
                        return (
                          <button
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                              isSelected
                                ? isAddon
                                  ? 'border-amber-500/60 bg-amber-500/5 shadow-sm'
                                  : 'border-primary/60 bg-primary/5 shadow-sm'
                                : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                            }`}
                          >
                            <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? isAddon
                                  ? 'bg-amber-500 border-amber-500'
                                  : 'bg-primary border-primary'
                                : 'border-muted-foreground/30'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-foreground">{product.name}</p>
                                {isSelected && isAddon && (
                                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                                    +£{ADDON_PRICE.toLocaleString()}
                                  </Badge>
                                )}
                                {isSelected && !isAddon && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                                    Included
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-secondary" />
                    <CardHeader className="pt-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-3 mx-auto">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">Your Subscription</CardTitle>
                      <CardDescription>Annual billing</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="pb-3 border-b border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium text-sm">Team Seats</p>
                            <p className="text-xs text-muted-foreground">£{SEAT_PRICE}/seat/year (min {MIN_SEATS})</p>
                          </div>
                          <span className="font-semibold">£{seatTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSeatCount(Math.max(MIN_SEATS, seatCount - 1))}
                            disabled={seatCount <= MIN_SEATS}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-lg w-8 text-center">{seatCount}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSeatCount(seatCount + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Products selected</span>
                        <span className="font-medium">{selectedProducts.length} / {INCLUDED_PRODUCTS}{addonCount > 0 ? ` + ${addonCount}` : ''}</span>
                      </div>

                      {addonCount > 0 && (
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <div>
                            <p className="font-medium text-sm text-amber-600 dark:text-amber-400">Add-on Products</p>
                            <p className="text-xs text-muted-foreground">{addonCount} × £{ADDON_PRICE.toLocaleString()}/year</p>
                          </div>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">+£{addonTotal.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="bg-muted/50 rounded-lg p-4 mt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-lg">Total</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold">£{totalPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground text-sm">/year</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          That's £{Math.round(totalPrice / 12)}/month
                        </p>
                      </div>

                      {selectedProducts.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Products</p>
                          {selectedProducts.map((id, idx) => {
                            const product = investmentProducts.find(p => p.id === id);
                            const isAddonItem = idx >= INCLUDED_PRODUCTS;
                            return (
                              <div key={id} className="flex items-center gap-2 text-xs">
                                <Check className={`h-3 w-3 flex-shrink-0 ${isAddonItem ? 'text-amber-500' : 'text-primary'}`} />
                                <span className="text-foreground">{product?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pb-8 flex-col gap-3">
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white border-0 text-lg py-6"
                        size="lg"
                        disabled={selectedProducts.length < 1 || loading === 'finance-FlowPulse Finance'}
                        onClick={() => handleCheckout(
                          'price_finance_modular',
                          'subscription',
                          'FlowPulse Finance',
                          'finance'
                        )}
                      >
                        {loading === 'finance-FlowPulse Finance' ? 'Loading...' : selectedProducts.length < 1 ? 'Select at least 1 product' : 'Get Started Now'}
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        Cancel anytime • 14-day money-back guarantee
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2 text-primary">Teams</h2>
              <p className="text-muted-foreground">
                Multi-tenant organisation support for enterprises and growing teams
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 to-violet-600" />
                <CardHeader className="pt-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl">Enterprise Teams</CardTitle>
                  <CardDescription className="text-lg">Custom quotation for your organisation</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">Contact Us</div>
                    <p className="text-muted-foreground">Get a tailored plan for your team size and requirements</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
                      <div key={idx} className="flex items-center gap-2">
                        <div className="rounded-full p-1 bg-gradient-to-r from-indigo-600 to-violet-600 flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pb-8 flex-col gap-3">
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white border-0 text-lg py-6"
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
