import { useState } from "react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Users, TrendingUp, Shield, CreditCard, Plus, Minus, Package, Sparkles, Zap, Lock, Globe, HeadphonesIcon, BarChart3, ToggleLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Finance state
  const [selectedFinanceProducts, setSelectedFinanceProducts] = useState<string[]>([]);
  const [financeSeatCount, setFinanceSeatCount] = useState(3);
  const [financeBillingAnnual, setFinanceBillingAnnual] = useState(true);

  // Investor state
  const [selectedInvestorProducts, setSelectedInvestorProducts] = useState<string[]>([]);
  const [investorBillingAnnual, setInvestorBillingAnnual] = useState(true);

  const handleCheckout = async (
    priceId: string,
    mode: 'subscription' | 'payment',
    planName: string,
    platform: 'investor' | 'finance'
  ) => {
    setLoading(`${platform}-${planName}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, mode, planName, platform },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleContactSales = () => {
    toast({ title: "Contact Sales", description: "Our team will be in touch shortly to discuss your custom requirements." });
  };

  const financeProducts = [
    { id: "stocks", name: "Stocks & Equities", description: "Listed equities, IPOs & secondary offerings", icon: "📈" },
    { id: "crypto", name: "Crypto & Digital Assets", description: "Cryptocurrency and blockchain investments", icon: "₿" },
    { id: "real-estate", name: "Real Estate", description: "Commercial & residential property deals", icon: "🏢" },
    { id: "fixed-income", name: "Fixed Income & Bonds", description: "Government & corporate bonds", icon: "📊" },
    { id: "commodities", name: "Commodities", description: "Gold, oil, agriculture & natural resources", icon: "⛏️" },
    { id: "forex", name: "Foreign Exchange", description: "FX opportunities & currency markets", icon: "💱" },
    { id: "funds-etfs", name: "Funds & ETFs", description: "Fund analysis, scoring & selection", icon: "📋" },
    { id: "alternatives", name: "Alternative Investments", description: "Hedge funds, art, wine & collectibles", icon: "🎨" },
    { id: "esg-impact", name: "ESG & Impact Investing", description: "Sustainable & socially responsible opportunities", icon: "🌱" },
    { id: "private-equity", name: "Private Equity", description: "Buyouts, growth equity & PE fund opportunities", icon: "🏛️" },
    { id: "venture-capital", name: "Venture Capital", description: "Early & growth-stage startup investments", icon: "🚀" },
    { id: "infrastructure", name: "Infrastructure", description: "Energy, transport & digital infrastructure assets", icon: "🛠️" },
    { id: "sme-acquisitions", name: "SME Acquisitions", description: "Small & mid-cap business acquisition deals", icon: "🤝" },
    { id: "distressed-assets", name: "Distressed Assets", description: "Special situations & distressed opportunities", icon: "⚠️" },
    { id: "debt-lending", name: "Debt & Lending", description: "Private credit, direct lending & debt facilities", icon: "🏦" },
  ];

  const investorProducts = [
    { id: "stocks", name: "Stocks & Equities", description: "Listed equities, IPOs & secondary offerings", icon: "📈" },
    { id: "crypto", name: "Crypto & Digital Assets", description: "Cryptocurrency and blockchain investments", icon: "₿" },
    { id: "real-estate", name: "Real Estate", description: "Commercial & residential property deals", icon: "🏢" },
    { id: "fixed-income", name: "Fixed Income & Bonds", description: "Government & corporate bonds", icon: "📊" },
    { id: "commodities", name: "Commodities", description: "Gold, oil, agriculture & natural resources", icon: "⛏️" },
    { id: "forex", name: "Foreign Exchange", description: "FX opportunities & currency markets", icon: "💱" },
    { id: "funds-etfs", name: "Funds & ETFs", description: "Fund analysis, scoring & selection", icon: "📋" },
    { id: "alternatives", name: "Alternative Investments", description: "Hedge funds, art, wine & collectibles", icon: "🎨" },
    { id: "esg-impact", name: "ESG & Impact Investing", description: "Sustainable & socially responsible opportunities", icon: "🌱" },
    { id: "fractional-pe-vc", name: "Fractional Private Equity / VC", description: "Crowdfunding, syndicates & fractional deals", icon: "💎" },
    { id: "private-market-platforms", name: "Private Market Platforms", description: "Secondary shares & pre-IPO marketplaces", icon: "🔁" },
    { id: "derivatives", name: "Derivatives", description: "Options, futures, swaps & structured derivatives", icon: "📐" },
    { id: "capital-protected-notes", name: "Capital-Protected & Income Notes", description: "Structured notes with capital protection or income", icon: "🛡️" },
    { id: "savings-yield", name: "Savings, Cash & Yield Products", description: "High-yield savings, money market & cash equivalents", icon: "💰" },
    { id: "pensions-tax-wrappers", name: "Pensions & Tax Wrappers", description: "SIPPs, ISAs & tax-efficient investment vehicles", icon: "🧾" },
    { id: "thematics-packaged", name: "Thematics & Packaged Investing", description: "Thematic baskets & packaged investment products", icon: "📦" },
    { id: "copy-trading", name: "Copy Trading", description: "Mirror & social trading strategies", icon: "👥" },
  ];

  // Finance pricing constants
  const FINANCE_ANNUAL_SEAT_PRICE_MONTHLY = 89; // per seat per month when billed annually
  const FINANCE_MONTHLY_SEAT_PRICE_MONTHLY = Math.ceil(89 * 1.2); // 20% more = £107/seat/month
  const FINANCE_SEAT_PRICE_MONTHLY = financeBillingAnnual ? FINANCE_ANNUAL_SEAT_PRICE_MONTHLY : FINANCE_MONTHLY_SEAT_PRICE_MONTHLY;
  const FINANCE_MIN_SEATS = 3;
  const FINANCE_INCLUDED_PRODUCTS = 3;
  const FINANCE_ADDON_PRICE_ANNUAL = 1200; // per year
  const FINANCE_ADDON_PRICE_MONTHLY = Math.ceil(1200 / 12 * 1.2); // 20% more = £120/month

  // Investor pricing constants
  const INVESTOR_MONTHLY_PRICE = 50;
  const INVESTOR_ANNUAL_MONTHLY = 40; // 20% off
  const INVESTOR_INCLUDED_PRODUCTS = 3;
  const INVESTOR_ADDON_MONTHLY = 10;
  const INVESTOR_ADDON_ANNUAL = 8; // 20% off

  const toggleFinanceProduct = (id: string) => {
    setSelectedFinanceProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleInvestorProduct = (id: string) => {
    setSelectedInvestorProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Finance calculations
  const financeAddonCount = Math.max(0, selectedFinanceProducts.length - FINANCE_INCLUDED_PRODUCTS);
  const financeAddonPrice = financeBillingAnnual ? FINANCE_ADDON_PRICE_ANNUAL : FINANCE_ADDON_PRICE_MONTHLY;
  const financeSeatTotal = financeBillingAnnual
    ? financeSeatCount * FINANCE_SEAT_PRICE_MONTHLY * 12
    : financeSeatCount * FINANCE_SEAT_PRICE_MONTHLY;
  const financeAddonTotal = financeBillingAnnual
    ? financeAddonCount * FINANCE_ADDON_PRICE_ANNUAL
    : financeAddonCount * FINANCE_ADDON_PRICE_MONTHLY;
  const financeTotalPrice = financeSeatTotal + financeAddonTotal;
  const financeBillingLabel = financeBillingAnnual ? "/yr" : "/mo";

  // Investor calculations
  const investorAddonCount = Math.max(0, selectedInvestorProducts.length - INVESTOR_INCLUDED_PRODUCTS);
  const investorBasePrice = investorBillingAnnual ? INVESTOR_ANNUAL_MONTHLY : INVESTOR_MONTHLY_PRICE;
  const investorAddonPrice = investorBillingAnnual ? INVESTOR_ADDON_ANNUAL : INVESTOR_ADDON_MONTHLY;
  const investorMonthlyTotal = investorBasePrice + (investorAddonCount * investorAddonPrice);
  const investorAnnualTotal = investorMonthlyTotal * 12;

  const trustMetrics = [
    { value: "£2.4B+", label: "Assets Tracked" },
    { value: "1,200+", label: "Advisory Firms" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "SOC 2", label: "Certified" },
  ];

  const ProductGrid = ({ products, selectedProducts, toggleProduct, includedCount, addonPriceLabel }: {
    products: typeof investmentProducts;
    selectedProducts: string[];
    toggleProduct: (id: string) => void;
    includedCount: number;
    addonPriceLabel: string;
  }) => (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {products.map((product) => {
        const isSelected = selectedProducts.includes(product.id);
        const selectionIndex = selectedProducts.indexOf(product.id);
        const isAddon = selectionIndex >= includedCount;
        return (
          <button
            key={product.id}
            onClick={() => toggleProduct(product.id)}
            className={`group relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
              isSelected
                ? isAddon
                  ? 'border-warning/50 bg-warning/5 shadow-sm shadow-warning/10'
                  : 'border-primary/50 bg-primary/5 shadow-sm shadow-primary/10'
                : 'border-border/40 hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm'
            }`}
          >
            <span className="text-lg mt-0.5 flex-shrink-0">{product.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-semibold text-sm text-foreground leading-tight">{product.name}</p>
                {isSelected && isAddon && (
                  <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px] px-1.5 py-0 font-medium">
                    +{addonPriceLabel}
                  </Badge>
                )}
                {isSelected && !isAddon && (
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 font-medium">
                    Included
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{product.description}</p>
            </div>
            <div className={`absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? isAddon ? 'bg-warning border-warning' : 'bg-primary border-primary'
                : 'border-muted-foreground/25 group-hover:border-primary/40'
            }`}>
              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
          </button>
        );
      })}
    </div>
  );

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

      <div className="relative z-10 container mx-auto px-4 py-8 pt-16 max-w-7xl">
        <Tabs defaultValue="finance" className="mb-16">
          <div className="flex justify-center mb-10">
            <TabsList className="inline-flex w-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/30">
              <TabsTrigger value="finance" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <TrendingUp className="h-4 w-4 mr-2" />
                FlowPulse Finance
              </TabsTrigger>
              <TabsTrigger value="investor" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <Sparkles className="h-4 w-4 mr-2" />
                FlowPulse Investor
              </TabsTrigger>
              <TabsTrigger value="teams" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <Users className="h-4 w-4 mr-2" />
                Enterprise Teams
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ============ FlowPulse Finance Tab ============ */}
          <TabsContent value="finance">
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-card to-secondary/5 border border-border/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-2xl font-bold text-foreground font-space-grotesk">£{FINANCE_SEAT_PRICE_MONTHLY}</span>
                      <span className="text-muted-foreground text-sm">/seat/month</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {financeBillingAnnual && <Badge className="bg-primary/10 text-primary border-primary/20 font-normal">20% off annual</Badge>}
                    <Badge variant="outline" className="border-border/50 font-normal">Min {FINANCE_MIN_SEATS} seats</Badge>
                    <Badge variant="outline" className="border-border/50 font-normal">{FINANCE_INCLUDED_PRODUCTS} products included</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${!financeBillingAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                  <Switch checked={financeBillingAnnual} onCheckedChange={setFinanceBillingAnnual} />
                  <span className={`text-sm font-medium ${financeBillingAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2 font-space-grotesk">
                          <Package className="h-5 w-5 text-primary" />
                          Investment Products
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Select {FINANCE_INCLUDED_PRODUCTS} core products free with your subscription
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {selectedFinanceProducts.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductGrid
                      products={investmentProducts}
                      selectedProducts={selectedFinanceProducts}
                      toggleProduct={toggleFinanceProduct}
                      includedCount={FINANCE_INCLUDED_PRODUCTS}
                      addonPriceLabel={financeBillingAnnual ? `£${FINANCE_ADDON_PRICE_ANNUAL.toLocaleString()}/yr` : `£${FINANCE_ADDON_PRICE_MONTHLY}/mo`}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <Card className="relative overflow-hidden border-primary/20 bg-card/90 backdrop-blur-sm shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                    <CardHeader className="pt-8 pb-4 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                        <img src={flowpulseLogo} alt="FlowPulse" className="h-10 w-auto" />
                      </div>
                      <CardTitle className="text-lg font-space-grotesk">Finance Subscription</CardTitle>
                      <CardDescription className="text-xs">{financeBillingAnnual ? "Annual" : "Monthly"} billing — cancel anytime</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6">
                      {/* Seat selector */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-semibold text-sm">Team Seats</p>
                            <p className="text-[11px] text-muted-foreground">£{FINANCE_SEAT_PRICE_MONTHLY}/seat/mo · min {FINANCE_MIN_SEATS}</p>
                          </div>
                          <span className="font-bold text-foreground font-space-grotesk">£{financeSeatTotal.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">{financeBillingLabel}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50"
                            onClick={() => setFinanceSeatCount(Math.max(FINANCE_MIN_SEATS, financeSeatCount - 1))}
                            disabled={financeSeatCount <= FINANCE_MIN_SEATS}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="font-bold text-2xl font-space-grotesk">{financeSeatCount}</span>
                            <span className="text-xs text-muted-foreground ml-1">seats</span>
                          </div>
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50"
                            onClick={() => setFinanceSeatCount(financeSeatCount + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-muted-foreground">Products selected</span>
                        <span className="font-semibold font-space-grotesk">
                          {selectedFinanceProducts.length} / {FINANCE_INCLUDED_PRODUCTS}
                          {financeAddonCount > 0 && <span className="text-warning ml-1">+{financeAddonCount}</span>}
                        </span>
                      </div>

                      {financeAddonCount > 0 && (
                        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-warning">Add-on Products</p>
                              <p className="text-[11px] text-muted-foreground">{financeAddonCount} × £{financeAddonPrice.toLocaleString()}{financeBillingLabel}</p>
                            </div>
                            <span className="font-bold text-warning font-space-grotesk">+£{financeAddonTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-muted/30 to-secondary/10 border border-primary/15 mt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm text-muted-foreground">{financeBillingAnnual ? "Annual" : "Monthly"} Total</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold font-space-grotesk text-foreground">£{financeTotalPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground text-xs">{financeBillingLabel}</span>
                          </div>
                        </div>
                        {financeBillingAnnual && (
                          <p className="text-[11px] text-muted-foreground text-right mt-1">
                            ≈ £{Math.round(financeTotalPrice / 12).toLocaleString()}/month
                          </p>
                        )}
                        {!financeBillingAnnual && (
                          <p className="text-[11px] text-muted-foreground text-right mt-1">
                            Save 20% with annual billing
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pb-8 pt-4 flex-col gap-3 px-6">
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 text-base py-6 rounded-xl shadow-lg shadow-primary/20 font-semibold"
                        size="lg"
                        disabled={selectedFinanceProducts.length < 1 || loading === 'finance-FlowPulse Finance'}
                        onClick={() => handleCheckout('price_finance_modular', 'subscription', 'FlowPulse Finance', 'finance')}
                      >
                        {loading === 'finance-FlowPulse Finance' ? 'Loading...' : selectedFinanceProducts.length < 1 ? 'Select at least 1 product' : 'Get Started Now'}
                      </Button>
                      <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure checkout</span>
                        <span>•</span>
                        <span>14-day guarantee</span>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ============ FlowPulse Investor Tab ============ */}
          <TabsContent value="investor">
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-card to-violet-500/5 border border-border/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="text-2xl font-bold text-foreground font-space-grotesk">£{investorBasePrice}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="border-border/50 font-normal">{INVESTOR_INCLUDED_PRODUCTS} products included</Badge>
                    <Badge variant="outline" className="border-border/50 font-normal">No seat minimum</Badge>
                    {investorBillingAnnual && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-normal">20% off annual</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${!investorBillingAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                  <Switch checked={investorBillingAnnual} onCheckedChange={setInvestorBillingAnnual} />
                  <span className={`text-sm font-medium ${investorBillingAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2 font-space-grotesk">
                          <Package className="h-5 w-5 text-emerald-500" />
                          Investment Products
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Select {INVESTOR_INCLUDED_PRODUCTS} core products included in your plan
                        </CardDescription>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {selectedInvestorProducts.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductGrid
                      products={investmentProducts}
                      selectedProducts={selectedInvestorProducts}
                      toggleProduct={toggleInvestorProduct}
                      includedCount={INVESTOR_INCLUDED_PRODUCTS}
                      addonPriceLabel={`£${investorAddonPrice}/mo`}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <Card className="relative overflow-hidden border-emerald-500/20 bg-card/90 backdrop-blur-sm shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500" />
                    <CardHeader className="pt-8 pb-4 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                        <img src={flowpulseLogo} alt="FlowPulse" className="h-10 w-auto" />
                      </div>
                      <CardTitle className="text-lg font-space-grotesk">Investor Subscription</CardTitle>
                      <CardDescription className="text-xs">
                        {investorBillingAnnual ? "Annual billing — save 20%" : "Monthly billing — cancel anytime"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6">
                      {/* Billing toggle */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-sm">Base Plan</p>
                          <span className="font-bold text-foreground font-space-grotesk">
                            £{investorBasePrice}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                          </span>
                        </div>
                        {investorBillingAnnual && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              Save £{(INVESTOR_MONTHLY_PRICE - INVESTOR_ANNUAL_MONTHLY) * 12}/yr
                            </Badge>
                            <span className="text-[11px] text-muted-foreground line-through">£{INVESTOR_MONTHLY_PRICE}/mo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-muted-foreground">Products selected</span>
                        <span className="font-semibold font-space-grotesk">
                          {selectedInvestorProducts.length} / {INVESTOR_INCLUDED_PRODUCTS}
                          {investorAddonCount > 0 && <span className="text-warning ml-1">+{investorAddonCount}</span>}
                        </span>
                      </div>

                      {investorAddonCount > 0 && (
                        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-warning">Add-on Products</p>
                              <p className="text-[11px] text-muted-foreground">{investorAddonCount} × £{investorAddonPrice}/month</p>
                            </div>
                            <span className="font-bold text-warning font-space-grotesk">+£{investorAddonCount * investorAddonPrice}/mo</span>
                          </div>
                        </div>
                      )}

                      {/* Selected products list */}
                      {selectedInvestorProducts.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">Selected</p>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {selectedInvestorProducts.map((id, idx) => {
                              const product = investmentProducts.find(p => p.id === id);
                              const isAddonItem = idx >= INVESTOR_INCLUDED_PRODUCTS;
                              return (
                                <div key={id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-muted/20">
                                  <Check className={`h-3 w-3 flex-shrink-0 ${isAddonItem ? 'text-warning' : 'text-emerald-500'}`} />
                                  <span className="text-foreground truncate">{product?.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-muted/30 to-violet-500/10 border border-emerald-500/15 mt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm text-muted-foreground">
                            {investorBillingAnnual ? "Annual Total" : "Monthly Total"}
                          </span>
                          <div className="text-right">
                            {investorBillingAnnual ? (
                              <>
                                <span className="text-3xl font-bold font-space-grotesk text-foreground">£{investorAnnualTotal.toLocaleString()}</span>
                                <span className="text-muted-foreground text-xs">/yr</span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl font-bold font-space-grotesk text-foreground">£{investorMonthlyTotal}</span>
                                <span className="text-muted-foreground text-xs">/mo</span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right mt-1">
                          {investorBillingAnnual
                            ? `≈ £${investorMonthlyTotal}/month`
                            : `£${investorMonthlyTotal * 12}/year if billed annually`
                          }
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pb-8 pt-4 flex-col gap-3 px-6">
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white border-0 text-base py-6 rounded-xl shadow-lg shadow-emerald-500/20 font-semibold"
                        size="lg"
                        disabled={selectedInvestorProducts.length < 1 || loading === 'investor-FlowPulse Investor'}
                        onClick={() => handleCheckout('price_investor_modular', 'subscription', 'FlowPulse Investor', 'investor')}
                      >
                        {loading === 'investor-FlowPulse Investor' ? 'Loading...' : selectedInvestorProducts.length < 1 ? 'Select at least 1 product' : 'Subscribe Now'}
                      </Button>
                      <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure checkout</span>
                        <span>•</span>
                        <span>Cancel anytime</span>
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="mt-4 border-border/30 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Investor plan includes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <Shield className="h-3 w-3" />, text: "Enterprise MFA security" },
                          { icon: <Zap className="h-3 w-3" />, text: "Real-time alerts" },
                          { icon: <Globe className="h-3 w-3" />, text: "Global market data" },
                          { icon: <BarChart3 className="h-3 w-3" />, text: "AI-powered analysis" },
                          { icon: <HeadphonesIcon className="h-3 w-3" />, text: "Priority support" },
                          { icon: <Lock className="h-3 w-3" />, text: "Data encryption" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="text-emerald-500">{item.icon}</span>
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ============ Teams Tab ============ */}
          <TabsContent value="teams">
            <div className="max-w-4xl mx-auto">
              <Card className="relative overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="text-center pt-12 pb-8 px-8 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-5 mx-auto shadow-lg shadow-primary/25">
                    <Users className="h-10 w-10 text-primary-foreground" />
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
