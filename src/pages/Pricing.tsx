import { useState } from "react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Users, TrendingUp, Shield, CreditCard, Plus, Minus, Package, Sparkles, Zap, Lock, Globe, HeadphonesIcon, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const investmentProducts = [
    { id: "stocks", name: "Stocks & Equities", description: "Listed equities, IPOs & secondary offerings", icon: "📈" },
    { id: "crypto", name: "Crypto & Digital Assets", description: "Cryptocurrency and blockchain investments", icon: "₿" },
    { id: "real-estate", name: "Real Estate", description: "Commercial & residential property deals", icon: "🏢" },
    { id: "private-equity", name: "Private Equity", description: "PE deals, buyouts & growth capital", icon: "💎" },
    { id: "venture-capital", name: "Venture Capital", description: "Early-stage & startup funding rounds", icon: "🚀" },
    { id: "fixed-income", name: "Fixed Income & Bonds", description: "Government & corporate bonds", icon: "📊" },
    { id: "commodities", name: "Commodities", description: "Gold, oil, agriculture & natural resources", icon: "⛏️" },
    { id: "forex", name: "Foreign Exchange", description: "FX opportunities & currency markets", icon: "💱" },
    { id: "funds-etfs", name: "Funds & ETFs", description: "Fund analysis, scoring & selection", icon: "📋" },
    { id: "alternatives", name: "Alternative Investments", description: "Hedge funds, art, wine & collectibles", icon: "🎨" },
    { id: "infrastructure", name: "Infrastructure", description: "Energy, transport & utilities projects", icon: "⚡" },
    { id: "sme-acquisitions", name: "SME Acquisitions", description: "Small & medium business buy-side deals", icon: "🏭" },
    { id: "debt-lending", name: "Debt & Lending", description: "Private credit, bridging & mezzanine finance", icon: "🏦" },
    { id: "esg-impact", name: "ESG & Impact Investing", description: "Sustainable & socially responsible opportunities", icon: "🌱" },
    { id: "distressed", name: "Distressed Assets", description: "Turnarounds, workouts & special situations", icon: "🔄" },
  ];

  const MONTHLY_SEAT_PRICE = 89;
  const SEAT_PRICE = MONTHLY_SEAT_PRICE * 12;
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

  const trustMetrics = [
    { value: "£2.4B+", label: "Assets Tracked" },
    { value: "1,200+", label: "Advisory Firms" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "SOC 2", label: "Certified" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/3 blur-[150px] rounded-full" />
      </div>

      {/* Back button */}
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

        {/* Tabs */}
        <Tabs defaultValue="finance" className="mb-16">
          <div className="flex justify-center mb-10">
            <TabsList className="inline-flex w-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/30">
              <TabsTrigger value="finance" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <TrendingUp className="h-4 w-4 mr-2" />
                FlowPulse Finance
              </TabsTrigger>
              <TabsTrigger value="teams" className="px-8 py-2.5 text-sm font-semibold data-[state=active]:shadow-md">
                <Users className="h-4 w-4 mr-2" />
                Enterprise Teams
              </TabsTrigger>
            </TabsList>
          </div>

          {/* FlowPulse Finance Tab */}
          <TabsContent value="finance">
            {/* Pricing summary bar */}
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-card to-secondary/5 border border-border/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-2xl font-bold text-foreground font-space-grotesk">£{MONTHLY_SEAT_PRICE}</span>
                      <span className="text-muted-foreground text-sm">/seat/month</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="border-border/50 font-normal">Billed Annually</Badge>
                    <Badge variant="outline" className="border-border/50 font-normal">Min {MIN_SEATS} seats</Badge>
                    <Badge variant="outline" className="border-border/50 font-normal">{INCLUDED_PRODUCTS} products included</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add-ons: £{ADDON_PRICE.toLocaleString()}/yr each
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Product selector - wider */}
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
                          Select {INCLUDED_PRODUCTS} core products free with your subscription
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {selectedProducts.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {investmentProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        const selectionIndex = selectedProducts.indexOf(product.id);
                        const isAddon = selectionIndex >= INCLUDED_PRODUCTS;
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
                                    +£{ADDON_PRICE.toLocaleString()}
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
                            {/* Selection indicator */}
                            <div className={`absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? isAddon
                                  ? 'bg-warning border-warning'
                                  : 'bg-primary border-primary'
                                : 'border-muted-foreground/25 group-hover:border-primary/40'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription summary - sticky sidebar */}
              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <Card className="relative overflow-hidden border-primary/20 bg-card/90 backdrop-blur-sm shadow-2xl">
                    {/* Gradient top edge */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                    
                    <CardHeader className="pt-8 pb-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 mx-auto shadow-lg shadow-primary/25">
                        <TrendingUp className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-lg font-space-grotesk">Your Subscription</CardTitle>
                      <CardDescription className="text-xs">Annual billing — cancel anytime</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 px-6">
                      {/* Seat selector */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-semibold text-sm">Team Seats</p>
                            <p className="text-[11px] text-muted-foreground">£{MONTHLY_SEAT_PRICE}/seat/mo · min {MIN_SEATS}</p>
                          </div>
                          <span className="font-bold text-foreground font-space-grotesk">£{seatTotal.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/yr</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-border/50"
                            onClick={() => setSeatCount(Math.max(MIN_SEATS, seatCount - 1))}
                            disabled={seatCount <= MIN_SEATS}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="font-bold text-2xl font-space-grotesk">{seatCount}</span>
                            <span className="text-xs text-muted-foreground ml-1">seats</span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-border/50"
                            onClick={() => setSeatCount(seatCount + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Products count */}
                      <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-muted-foreground">Products selected</span>
                        <span className="font-semibold font-space-grotesk">
                          {selectedProducts.length} / {INCLUDED_PRODUCTS}
                          {addonCount > 0 && <span className="text-warning ml-1">+{addonCount}</span>}
                        </span>
                      </div>

                      {/* Add-on cost */}
                      {addonCount > 0 && (
                        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-warning">Add-on Products</p>
                              <p className="text-[11px] text-muted-foreground">{addonCount} × £{ADDON_PRICE.toLocaleString()}/year</p>
                            </div>
                            <span className="font-bold text-warning font-space-grotesk">+£{addonTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Selected products list */}
                      {selectedProducts.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">Selected</p>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {selectedProducts.map((id, idx) => {
                              const product = investmentProducts.find(p => p.id === id);
                              const isAddonItem = idx >= INCLUDED_PRODUCTS;
                              return (
                                <div key={id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-muted/20">
                                  <Check className={`h-3 w-3 flex-shrink-0 ${isAddonItem ? 'text-warning' : 'text-primary'}`} />
                                  <span className="text-foreground truncate">{product?.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-muted/30 to-secondary/10 border border-primary/15 mt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm text-muted-foreground">Annual Total</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold font-space-grotesk text-foreground">£{totalPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground text-xs">/yr</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right mt-1">
                          ≈ £{Math.round(totalPrice / 12).toLocaleString()}/month
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4 flex-col gap-3 px-6">
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 text-base py-6 rounded-xl shadow-lg shadow-primary/20 font-semibold"
                        size="lg"
                        disabled={selectedProducts.length < 1 || loading === 'finance-FlowPulse Finance'}
                        onClick={() => handleCheckout('price_finance_modular', 'subscription', 'FlowPulse Finance', 'finance')}
                      >
                        {loading === 'finance-FlowPulse Finance' ? 'Loading...' : selectedProducts.length < 1 ? 'Select at least 1 product' : 'Get Started Now'}
                      </Button>
                      <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure checkout</span>
                        <span>•</span>
                        <span>14-day guarantee</span>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* What's included mini card */}
                  <Card className="mt-4 border-border/30 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Every plan includes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <Shield className="h-3 w-3" />, text: "Bank-grade security" },
                          { icon: <Zap className="h-3 w-3" />, text: "Real-time analytics" },
                          { icon: <Globe className="h-3 w-3" />, text: "Multi-currency" },
                          { icon: <HeadphonesIcon className="h-3 w-3" />, text: "Priority support" },
                          { icon: <BarChart3 className="h-3 w-3" />, text: "Custom reports" },
                          { icon: <Lock className="h-3 w-3" />, text: "Data encryption" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="text-primary">{item.icon}</span>
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

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="max-w-4xl mx-auto">
              <Card className="relative overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                
                {/* Hero area */}
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
